---
publish: true
---




(1) 서버 로그인 ssh [username]@165.132.32.110  
(2) /home/hyobinjeong/Project_mosaicatcher_RPE_mixture_Tutorial  (example)
(3) run_mosaicatcher.sh 복사 (cp /home/shared/run_mosaicatcher.sh ./)  
(4) data, out 폴더 생성하기  
(5) data/RPE_mixture/fastq/*.gz (파일 이름을 .1.fastq.gz, .2.fastq.gz로 수정)  
(6) tmux  
(7) ssh node01  
(8) cd /home/hyobinjeong/Project_mosaicatcher_RPE_mixture_Tutorial  
(9) 도커 환경으로 들어가기 ./run_mosaicatcher.sh  
(10) ./run_pipelinev8.sh