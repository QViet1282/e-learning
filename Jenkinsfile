pipeline {
    agent { label 'server' }
    // triggers {
    //     githubPush() 
    // }
    environment {
        APP_DIR = '/var/jenkins/workspace/bbbb'
    }
    
    stages {
        stage('Install Dependencies') {
            steps {
                dir("${APP_DIR}/server") {
                    script {
                        try {
                            sh 'sudo yarn install'
                        } catch (Exception e) {
                            echo 'yarn install failed, cleaning up...'
                            sh 'sudo rm -rf node_modules yarn.lock'
                            sh 'sudo yarn install'
                        }
                    }
                }
                
            }
        }
        stage('Deploy') {
            steps {
                dir('/var/jenkins/workspace/bbbb/server') {
                        sh 'pm2 delete all || true' 
                        sh 'pm2 start "yarn start" --name myapp --max-memory-restart 140M' 
                        sh 'pm2 save' 
                    }
            }
        } 
    }
}
