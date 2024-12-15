/* eslint-disable camelcase */
const axios = require('axios');
const chatbot_url = 'https://chatbot-dot-nusatinggi.et.r.appspot.com';

// Fungsi untuk mengedit nomor gunung
exports.editMountain = async (req, res) => {
  try {
    const { nomor_gunung } = req.body;

    // Set nomor gunung ke cookie tanpa validasi
    res.cookie('nomor_gunung', nomor_gunung, { httpOnly: true, secure: true });
    res.json({ message: 'Nomor gunung berhasil diperbarui', nomor_gunung });
  } catch (error) {
    console.error('Error updating mountain number:', error.message);
    res.status(500).json({ error: 'Failed to update mountain number' });
  }
};

// Fungsi untuk memanggil Flask API untuk prediksi
exports.predictChatbot = async (req, res) => {
  try {
    const { user_input } = req.body;
    const nomor_gunung = req.cookies.nomor_gunung || 0;

    const response = await axios.post(`${chatbot_url}/chat`, { user_input, nomor_gunung: parseInt(nomor_gunung) });

    res.json({ response: response.data.response });
  } catch (error) {
    console.error('Error interacting with chatbot:', error.message);
    res.status(500).json({ error: 'Failed to communicate with chatbot' });
  }
};
