### Como instalar o PHP Bridge

1. Crie uma pasta chamada `api` ou `mail` na raiz do seu site (public_html).
2. Faça upload do arquivo `send.php` para lá.
3. Baixe o PHPMailer e coloque na mesma pasta (pastas `src` contendo Exception.php, PHPMailer.php, SMTP.php).
   - Link direto: https://github.com/PHPMailer/PHPMailer/archive/refs/heads/master.zip
   - Extraia e renomeie a pasta para que fique estruturado assim:
     /public_html/api/send.php
     /public_html/api/src/PHPMailer.php
     /public_html/api/src/SMTP.php
     /public_html/api/src/Exception.php

4. No painel do sistema, selecione "PHP Bridge" e coloque a URL:
   `https://seu-dominio.com.br/api/send.php`
