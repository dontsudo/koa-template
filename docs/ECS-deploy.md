## 요약

1) 깃헙의 `main` 브랜치에 푸시될 때마다
2) 깃헙 액션이 도커 이미지를 빌드하고 Amazon ECR에 푸시하면
3) 새로운 task definition (TD)가 ECS에 배포됩니다.

## 사전 작업

```bash
# 로드밸런서 생성 - 리스너 => 타겟 그룹
$ aws elbv2 create-load-balancer \
	--name koa-rest-api-load-balancer \
	--subnets subnet-07abdb99fdd31cc54 subnet-0823d0f4dc2486532 subnet-04b180195bbae444b \
	--security-groups sg-0fda93b7359242edd sg-0060fbfb8a401dc14 \
	| jq '.LoadBalancers[0] | .LoadBalancerArn'
"arn:aws:elasticloadbalancing:ap-northeast-2:140608817702:loadbalancer/app/koa-rest-api-load-balancer/6fc248cda1a068c4"

# 타깃 그룹 생성 (여기서 PORT는 ECS에서 크게 의미가 없습니다.)
$ aws elbv2 create-target-group \
	--name koa-rest-api-load-balancer \
	--protocol HTTP --port 3000 --vpc-id vpc-0563d860505e450a3 \
	| jq '.TargetGroups[0] | .TargetGroupArn'
"arn:aws:elasticloadbalancing:ap-northeast-2:140608817702:targetgroup/koa-rest-api-load-balancer/71cd54addfba46f2"

# 리스너 생성
$ aws elbv2 create-listener \
  --protocol HTTP --port 80 \
  --load-balancer-arn='arn:aws:elasticloadbalancing:ap-northeast-2:140608817702:loadbalancer/app/koa-rest-api-load-balancer/6fc248cda1a068c4' \
  --default-actions 'Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:ap-northeast-2:140608817702:targetgroup/koa-rest-api-load-balancer/71cd54addfba46f2'
```

```bash
# ECR 생성
$ aws ecr create-repository \
    --repository-name koa-rest-api \
    --region ap-northeast-2

"140608817702.dkr.ecr.ap-northeast-2.amazonaws.com/koa-rest-api"

# 도커 클라이언트에서 ECR 로그인
$ aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 140608817702.dkr.ecr.ap-northeast-2.amazonaws.com
```

```bash
# 클러스터 생성
$ aws ecs create-cluster --cluster-name koa-rest-api-cluster
$ aws ecs list-clusters | jq '.clusterArns[]'
"arn:aws:ecs:ap-northeast-2:140608817702:cluster/koa-rest-api-cluster"

# 연결을 위한 EC2 인스턴스
$ aws ec2 run-instances \
	--image-id ami-0e53bb0915684e07b \
	--count 1 \
	--instance-type t3.micro \
	--security-group-ids sg-0fda93b7359242edd sg-0060fbfb8a401dc14 \
	--subnet-id subnet-07abdb99fdd31cc54 \
	--iam-instance-profile Name=ecs-instance-profile \
	--user-data file://userdata.sh \
	--associate-public-ip-address

# task definition (작업 정의)
$ aws ecs register-task-definition --cli-input-json file://task-definition.json \
	| jq '.taskDefinition | .taskDefinitionArn'
"arn:aws:ecs:ap-northeast-2:140608817702:task-definition/koa-rest-api-td:2"

# service 생성
$ aws ecs create-service \
	--cluster=koa-rest-api-cluster --cli-input-json file://service.json
```




## 참고 자료

- https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider/deploying-to-amazon-elastic-container-service
- https://www.44bits.io/ko/post/container-orchestration-101-with-docker-and-aws-elastic-container-service
- https://aws.amazon.com/ko/premiumsupport/knowledge-center/ecs-fargate-task-database-connection/
