newman run clase8.json -e ..\localhost.environment.json 


cd Test
cd crear_usuarios

newman run crear_usuarios.json -d data.json -e ..\localhost.environment.json




newman run crear_usuarios.json -d data.json -e ..\localhost.environment.json --reporters cli,allure --reporter-allure-export ./allure-results


--reporters cli,allure --reporter-allure-export ./allure-results


 curl -X POST "$ALLURE_SERVER/send-results?project_id=$ALLURE_PROJECT_NAME&force_project_creation=true" \
        $(find allure-results -type f -exec echo -n "-F files[]=@{} " \;) 
      curl -X GET "$ALLURE_SERVER/generate-report?project_id=$ALLURE_PROJECT_NAME"


curl -X POST "http://localhost:5050/send-results?project_id=demo" $(find allure-results -type f -exec echo -n "-F files[]=@{} " \;) 