// api/contact.js
// Função serverless do Vercel — roda no servidor, nunca expõe a chave no front-end

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { nome, email, assunto, mensagem, interesses } = req.body;

  // Validação básica no servidor
  if (!nome || !email || !assunto || !mensagem) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  // A chave vem da variável de ambiente — nunca escrita aqui no código!
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Monta o prompt para a IA
  const prompt = `
Você é um assistente de atendimento de uma loja de produtos de fã personalizados chamada FanForge Studio.
Um cliente enviou a seguinte mensagem pelo formulário de contato:

Nome: ${nome}
E-mail: ${email}
Assunto: ${assunto}
Interesses: ${interesses?.join(', ') || 'não informado'}
Mensagem: ${mensagem}

Gere uma resposta de e-mail simpática, personalizada e profissional para esse cliente.
Responda em português do Brasil. Seja acolhedor, mencione o produto/assunto específico e informe que entrarão em contato em breve.
Mantenha a resposta curta (3-4 parágrafos).
  `.trim();

  try {
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await aiResponse.json();
    const resposta = data.content?.[0]?.text || 'Obrigado pelo contato!';

    return res.status(200).json({ ok: true, resposta });

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
