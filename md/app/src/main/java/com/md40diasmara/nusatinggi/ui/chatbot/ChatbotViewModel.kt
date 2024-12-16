package com.md40diasmara.nusatinggi.ui.chatbot

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.md40diasmara.nusatinggi.data.retrofit.ChatRepository
import kotlinx.coroutines.launch

class ChatbotViewModel(private val chatRepository: ChatRepository) : ViewModel() {

    private val _chatbotResponse = MutableLiveData<String>()
    val chatbotResponse: LiveData<String> get() = _chatbotResponse

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> get() = _error

    fun sendChat(message: String, token: String) {
        viewModelScope.launch {
            try {
                // Panggil repository untuk mengirim pesan
                val response = chatRepository.sendMessage(message, token)
                _chatbotResponse.postValue(response)
            } catch (e: Exception) {
                _error.postValue("Failed to send message: ${e.message}")
            }
        }
    }
}
