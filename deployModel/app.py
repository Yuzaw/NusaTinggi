from flask import Flask, request, jsonify, make_response
import pickle
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import json
import string
import random
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory

# Initialize Flask app
app = Flask(__name__)

# Load the trained model
model = load_model("best_model_1_baru.keras")

# Load tokenizer and label encoder
with open("tokenizer.pickle", "rb") as handle:
    tokenizer = pickle.load(handle)

with open("label_encoder.pickle", "rb") as handle:
    le = pickle.load(handle)

# Load dataset for responses
with open("DatasetFinal.json", "r") as file:
    dataset = json.load(file)

# Initialize stemmer
factory = StemmerFactory()
stemmer = factory.create_stemmer()

vocabulary = 500
max_len = 100

# Helper function to preprocess input text
def preprocess_input(text):
    # Remove punctuation and lowercase the input
    text = [letters.lower() for letters in text if letters not in string.punctuation]
    text = ''.join(text)
    text = stemmer.stem(text)
    # Tokenize and pad the input text
    seq = tokenizer.texts_to_sequences([text])
    padded_seq = pad_sequences(seq, maxlen=max_len, padding='post', truncating='post')
    return padded_seq

# Helper function to predict the intent
def predict_tag(text, model):
    padded_seq = preprocess_input(text)
    prediction = model.predict(padded_seq)
    predicted_index = np.argmax(prediction, axis=1)[0]
    predicted_tag = le.inverse_transform([predicted_index])[0]
    return predicted_tag

def chatbotresponse(Intent_print, nomor_gunung):
    Final_respone = ""
    if Intent_print ==  "Cuaca di Gunung"  or Intent_print == "Budaya" or Intent_print == "Jalur dan Waktu Pendakian" or Intent_print == "Komunitas Pendaki":
        dictionarty_gunung = {1: "Gunung Rinjani", 2: "Gunung Bromo", 3: "Gunung Merbabu", 4: "Gunung Prau", 5: "Gunung Ciremai", 6: "Gunung Ijen", 7: "Gunung Kerinci"}
        if Intent_print == "Budaya":
            if 1 <= nomor_gunung <= 7:
                for item in dataset:
                    if item["intent"] == Intent_print:
                        for response in item["response"]:
                            if response == dictionarty_gunung[nomor_gunung]:
                                Final_respone = response + " =" + item["response"][response]
            else:
                for item in dataset:
                    if item["intent"] == Intent_print:
                        for response in item["response"]:
                            Final_respone += response
                            a = response + " = " + (item["response"][response])
                            Final_respone += a + "\n\n"
        else:
            if 1 <= nomor_gunung <= 7:
                for item in dataset:
                    if item["intent"] == Intent_print:
                        for mountain in item["response"]:
                            if mountain == dictionarty_gunung[nomor_gunung]:
                                Final_respone = mountain + " :\n"
                                for response in item["response"][mountain]:
                                    Temp = response + " = " + item["response"][mountain][response]
                                    Final_respone += Temp + "\n\n"
            else:
                for item in dataset:
                    if item["intent"] == Intent_print:
                        for mountain in item["response"]:
                            Final_respone += mountain + " :\n"
                            for response in item["response"][mountain]:
                                Temp = response + " = " + item["response"][mountain][response]
                                Final_respone += Temp + "\n\n"
                            Final_respone += "\n\n"
    elif Intent_print in ["Salam", "Goodbye", "Thank You", "Confirmation", "Help", "Feedback"]: 
        for item in dataset:
            if item["intent"] == Intent_print:
                Final_respone = random.choice(item["response"])
    elif Intent_print == "Kebutuhan":
        for item in dataset:
            if item["intent"] == Intent_print:
                for response in item["response"]:
                    Final_respone += response + "\n"
                    for poin in item["response"][response]:
                        a = "- " + poin + "\n"
                        Final_respone += a
                    Final_respone += "\n"
    elif Intent_print in ["Peralatan Wajib", "Persiapan cost"]:
        for item in dataset:
            if item["intent"] == Intent_print:
                Final_respone = item["response"]
    else: 
        for item in dataset:        
            if item["intent"] == Intent_print:
                for response in item["response"]:
                    Final_respone += response
                    a = response + " = " + (item["response"][response])
                    Final_respone += a + "\n\n"
    return Final_respone

@app.route('/')
def home():
    return 'Server Connected'    

@app.route('/chat', methods=['POST'])
def ask():
    user_input = request.json.get('user_input')
    nomor_gunung = request.json.get('nomor_gunung', 0)
    predicted_tag = predict_tag(user_input, model)
    response = chatbotresponse(predicted_tag, nomor_gunung)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)
