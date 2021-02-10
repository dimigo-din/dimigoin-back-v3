# DIMIGOin Backend V3
![Docker Build and Deploy](https://github.com/dimigoin/dimigoin-back-v3/workflows/Docker%20Build%20and%20Deploy/badge.svg)
![Test Express Application](https://github.com/dimigoin/dimigoin-back-v3/workflows/Test%20Express%20Application/badge.svg)

## 개발 서버 실행 방법
1. 팀 노션에 있는 `.env` 파일과 Firebase Service Account Key를 프로젝트 최상단에 추가합니다.
2. 의존성 패키지를 설치합니다.
`yarn install`
3. 개발 서버를 실행합니다.
`yarn dev`

## 프로덕션 배포 방법
1. 도커 허브에서 최신 도커 이미지를 내려받습니다.
`docker pull dimigoin/dimigoin-server:latest`
2. 기존에 실행 중이던 컨테이너를 실행 중지 및 삭제합니다.
`docker rm -f dimigoin-server-prod`
3. 내려받은 도커 이미지를 실행합니다.
`docker run --name <컨테이너 이름> --env-file <dotenv 파일 경로> -p <컨테이너 내부 포트>:<외부에 노출할 포트> -d dimigoin/dimigoin-server`
`.env` 파일은 팀 노션을 참고해 `/etc` 디렉터리에 보관하는 것을 추천합니다.
