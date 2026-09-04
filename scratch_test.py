import requests

file_path = "D:\\HH_GOA_TASK3\\trust-trace\\apps\\api\\temp_uploads\\bd73b7a7-8f6d-477b-a85f-80b42debd5ec_Screenshot 2025-11-24 202107.png"

with open(file_path, 'rb') as f:
    response = requests.post("https://uguu.se/upload.php", files={"files[]": f})
    
print(response.status_code)
print(response.text)
