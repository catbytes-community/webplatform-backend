# AWS EC2 Deployment
This app is deployed on the AWS EC2 Linux VM.

To manage the VM you should sign in to AWS Console either as a root user or as an IAM user with proper access policies.

PM2 is used on the VM in order to run the server.

If you want to connect to the VM from your machine, please use the <webplatform-backend-key-pair.pem> key provided to you.

If you don't have the key, request it from the project team: <strong>marina.kim@catbytes.io</strong>

Here is the terminal command to login/SSH into EC2:
```bash
ssh -i /path/to/your-key.pem ec2-user@<EC2-PUBLIC-IP-OR-DNS>
```

If you have the .pem permission error, run the following command:
```bash
chmod 400 /path/to/your-key.pem
```


In order to deploy updated app, follow the steps below:
<ul>
  <li>Commit & push your updated code</li>
  <li>SSH into AWS EC2</li>
  <li>PM2 stop the server</li>
  <li>Git pull code changes</li>
  <li>Run server `node server.js` to test the changes are applied</li>
  <li>PM2 start the server</li>
</ul>