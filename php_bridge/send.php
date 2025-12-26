<?php
// Permitir chamadas de qualquer origem (CORS) - Importante para o React funcionar
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Responder imediatamente a requisições OPTIONS (Pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Carregar PHPMailer via Composer (se existir) OU Manual
// Se você não usa composer, baixe a pasta PHPMailer e ajuste os requires abaixo
// require 'vendor/autoload.php'; 
// --- OU MANUALMENTE (descomente se subir os arquivos na mao) ---
require 'src/Exception.php';
require 'src/PHPMailer.php';
require 'src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    // 1. Receber dados do React (JSON)
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        throw new Exception('Nenhum dado recebido ou JSON inválido.');
    }

    $to = $data['to'] ?? '';
    $subject = $data['subject'] ?? '';
    $html = $data['html'] ?? '';
    $config = $data['config'] ?? [];

    if (empty($to) || empty($subject) || empty($config)) {
        throw new Exception('Faltam parâmetros obrigatórios (to, subject, config).');
    }

    // 2. Configurar PHPMailer
    $mail = new PHPMailer(true);

    // Configurações de Servidor
    $mail->isSMTP();
    $mail->Host       = $config['host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['user'];
    $mail->Password   = $config['pass'];
    
    // Auto-detectar porta e segurança
    $mail->Port       = $config['port'];
    if ($config['port'] == 465) {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } else {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    }

    // Charset e Encoding
    $mail->CharSet = 'UTF-8';
    $mail->Encoding = 'base64';

    // Destinatários
    $mail->setFrom($config['sender_email'], $config['sender_name']);
    $mail->addAddress($to);

    // Conteúdo
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $html;
    $mail->AltBody = strip_tags($html);

    // 3. Enviar
    $mail->send();

    echo json_encode(['success' => true, 'message' => 'Email enviado com sucesso via PHP Bridge!']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => $mail->ErrorInfo ?? $e->getMessage()
    ]);
}
?>
