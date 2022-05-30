# 스치다!
  ![스치다 로고 1](https://practice2082.s3.ap-northeast-2.amazonaws.com/Slide+16_9+-+1+(4).png)




<p align='center'>
  <img src='https://img.shields.io/badge/Javascript-ES6-yellow?logo=javascript'/>
  <img src='https://img.shields.io/badge/Node.js-v16.14.2-green?logo=Node.js'/>
  <img src='https://img.shields.io/badge/Express-v4.17.3-black?logo=Express'/>
  <img src='https://img.shields.io/badge/MongoDB-v4.2.19-green?logo=mongodb'/>
  <img src='https://img.shields.io/badge/prettier-v2.5.1-pink?logo=prettier'/>
  <img src='https://img.shields.io/badge/Passport-v0.5.2-green?logo=passport'/>
  <img src='https://img.shields.io/badge/socket.io-v4.4.1-white?logo=Socket.io'/>
  <img src="https://img.shields.io/badge/Json Web Token-v8.5.1-8a8a8a?logo=JSON Web Tokens&logoColor=white" />
  </br></br>
  Deploy
  </br></br>
  <img src="https://img.shields.io/badge/Git hub-000000?logo=Github&logoColor=white" />
  
</p>

## 바로가기
- 사이트 바로가기 : https://seuchida.shop
- 발표 영상 : 

## 🎉 스치다 서비스 소개

### 시연 영상


### 1. 우리 동네 스포츠 친구찾기 서비스
<details> <summary>실시간 위치기반 서비스로 현재 내 위치를 기준으로 주변 운동친구들을 찾아주는 서비스입니다!</summary> <div markdown="1"> <img width='25%' src='https://practice2082.s3.ap-northeast-2.amazonaws.com/%EB%A6%AC%EB%93%9C%EB%AF%B8+%EC%9D%B4%EB%AF%B8%EC%A7%801.png'> </div> </details>


### 2. 혼자하기 힘든 운동들도 스치다를 통해 같이 운동할 수 있습니다!
<details> <summary>운동 종목과 운동할 장소, 시간을 정해서 같이 운동할 사람을 모집할 수 있습니다.</summary> <img width='25%' src='https://practice2082.s3.ap-northeast-2.amazonaws.com/%EB%A6%AC%EB%93%9C%EB%AF%B8+%EC%9D%B4%EB%AF%B8%EC%A7%802.png'> </details>

## ERD
![서비스 ERD](https://practice2082.s3.ap-northeast-2.amazonaws.com/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7+2022-05-30+%EC%98%A4%ED%9B%84+4.37.48.png)

## 서비스 아키텍처   

![서비스 아키텍처 (2)](https://practice2082.s3.ap-northeast-2.amazonaws.com/%EC%95%84%ED%82%A4%ED%83%9D%EC%B3%90+%EC%9D%B4%EB%AF%B8%EC%A7%80.PNG)

## &#128187;기술스택/라이브러리
### 기술스택
<table width = "200" style="text-align:center;" >
  <tr>
    <th height = "40"> 종류</th>
    <th height = "40">이름</th>

  </tr>
  <tr>
    <td>서버 프레임워크</td>
    <td>Express</td>
  </tr>
  <tr>
    <td>Https</td>
    <td>Route53</td>
  </tr>
  <tr>
    <td >Database</td>
    <td>MongoDB, AtlasDB</td>
  </tr>
  <tr>
    <td >CI</td>
    <td>GithubAction</td>
  </tr>
  <tr>
    <td >CD</td>
    <td>GithubAction</td>
  </tr>
  <tr>
    <td >이미지파일 저장소</td>
    <td>S3</td>
  </tr>
  <tr>
    <td >로드밸런스</td>
    <td>AWS ELB</td>
  </tr>
  <tr>
    <td >실시간데이터통신</td>
    <td>socket.io</td>
  </tr>

<table width = "200" style="text-align:center;" >
  <tr>
    <th height = "40">라이브러리</th>
    <th height = "40">Appliance</th>

  </tr>
  <tr>
    <td >dotenv</td>
    <td>포트값외 중요한값 보안처리</td>
  </tr>
  <tr>
    <td >Mongoose</td>
    <td>MongoDB 데이터 모델링</td>
  </tr>
  <tr>
    <td >Cors</td>
    <td>Request Resource 제한</td>
  </tr>
   <tr>
    <td>passport,passport-google-oauth20,passport-kakao</td>
    <td> 소셜 로그인 </td>
  </tr>
  <tr>
    <td >jsonwebtoken</td>
    <td> 암호화 </td>
  </tr>
  <tr>
    <td>cryptojs</td>
    <td> 암호화 </td>
  </tr>
   <tr>
    <td>prettier</td>
    <td> 클린코드 </td>
  </tr>
  <tr>
    <td>multer-s3</td>
    <td> s3이미지 업로드 </td>
  </tr>
  <tr>
    <td>Joi
</td>
    <td> 유효성 검사 </td>
  </tr>
</table>

## 트러블 슈팅 & 기술적 도전 
### 1. 방화벽 관련 이슈
<details> <summary>(1) 깃헙액션 : dial tcp 타임아웃 에러</summary> 깃헙액션 : dial tcp 타임아웃 에러가 있었습니다. 에러 관련 검색 후 가장 흔한 원인은 방화벽 문제로 파악이 되었으나, 방화벽 설정을 해두지 않았기 때문에 그 다음 해결방안으로 보안그룹 부분을 살펴보았습니다. 저희 팀은 작업 초기에 보안그룹 설정으로 인해 데이터베이스를 해킹된 적이 있어 팀원들의 IP로만 포트만 열어두었습니다. 하지만 이로 인해 i/o time out 에러가 발생하여, CD 과정에서 build가  실패하게 되었다는 것을 파악했습니다. 이를 해결하기 위해 IP를 확장해주었고, 성공적으로 CICD 파이프라인을 구축할 수 있었습니다.
  <img src='https://practice2082.s3.ap-northeast-2.amazonaws.com/KakaoTalk_Photo_2022-05-30-22-38-35.png'>
  </details>
<details> <summary>(2) 로드밸런서(타겟그룹 health check & 보안그룹)</summary> 로드밸런서(타겟그룹 health check & 보안그룹) : 로드밸런서를 사용하기위해서는 먼저 타켓그룹(어떤 ec2에서 사용을 할것인지)를 지정해줘야하는데, 그때 헬시체크가 진행됩니다. 클라이언트로부터 데이터가 넘어오면서 로드밸런서를 통해 서버로 넘어오는데 이때 통과를 해서 health check 엔드포인트로 접속이 가능해야 health check가 됩니다. 이 부분에서도 역시나 보안그룹의 포트 설정이 필요했는데 이때 로드벨런서의 보안그룹과 타겟그룹의 보안그룹이 달라야했으며, 타겟그룹내의 각  ec2의 보안그룹은 동일해야 했습니다. 이또한 데이터베이스의 해킹경험으로 인해 모든 사람들이 접근하지 못하게 막음으로 인해서 생겼던 이슈였습니다. 443포트와 80포트 22포트를 상황에 맞게 열어줌으로써 문제를 해결했습니다.
  <img src='https://practice2082.s3.ap-northeast-2.amazonaws.com/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7+2022-05-30+%EC%98%A4%ED%9B%84+6.03.30.png'>
</details>

### 2. 데이터베이스 해킹 이슈
<details> <summary>EC2 보안그룹 설정 이슈</summary> 초반 작업에서 서버 내부에 몽고디비를 설치하고 사용자 계정을 생성하여 robo3T를 사용하여 데이터를 관리하던 중, 전체 데이터 손실과 경고 메시지를 확인했습니다. 확인 결과, 이는 EC2서버의 보안그룹 설정 미흡으로 인해 해커가 서버 접속을 통해 아이디 및 비밀번호를 알아내어 발생한 결과로 나타났습니다. 추가 데이터 손해를 방지하기 위해 보안그룹 포트, IP를 작업자(팀원)들로 하여 기존 보안 수준을 강화했습니다.
 </details>

## 📌 팀원소개
### 백엔드
<table width = "200" style="text-align:center;" >
  <tr>
    <th height = "40"> Name</th>
    <th height = "40"> Github</th>
  </tr>
  <tr>
    <td> 신상렬 </td>
    <td> https://github.com/gofl26 </td>
  </tr>
  <tr>
    <td> 윤영수 </td>
    <td> https://github.com/tayyoon </td>
  </tr>
  <tr>
    <td> 김연유 </td>
    <td> https://github.com/gitmackenzie </td>
  </tr>
</table>
  
### 프론트엔드
<table width = "200" style="text-align:center;" >
  <tr>
    <th height = "40"> Name</th>
    <th height = "40">Github</th>
  </tr>
  <tr>
    <td> 이태훈 </td>
    <td> https://github.com/gitmackenzie </td>
  </tr>
  <tr>
    <td> 최정원 </td>
    <td> https://github.com/gitmackenzie </td>
  </tr>
  <tr>
    <td> 강형원 </td>
    <td> https://github.com/gitmackenzie </td>
  </tr>
</table>

### 디자이너
<table width = "200" style="text-align:center;" >
  <tr>
    <th height = "40"> Name</th>
    <th height = "40">Blog</th>
  </tr>
  <tr>
    <td> 이수림 </td>
    <td>  </td>
  </tr>
  <tr>
    <td>장유진</td>
    <td> https://github.com/gitmackenzie </td>
  </tr>
</table>
