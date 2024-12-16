package com.md40diasmara.nusatinggi.ui.chatbot

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.md40diasmara.nusatinggi.databinding.FragmentChatbotBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import org.json.JSONException
import org.json.JSONObject

class ChatbotFragment : Fragment() {

    private var _binding: FragmentChatbotBinding? = null
    private val binding get() = _binding!!

    private val mountainList = listOf(
        "Gunung Rinjani" to "1",
        "Gunung Bromo" to "2",
        "Gunung Merbabu" to "3",
        "Gunung Prau" to "4",
        "Gunung Ciremai" to "5",
        "Gunung Ijen" to "6",
        "Gunung Kerinci" to "7",
        "General" to "8"
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentChatbotBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val client = OkHttpClient()

        // Inisialisasi Spinner
        val mountainNames = mountainList.map { it.first }
        val spinnerAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, mountainNames).apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
        binding.mountainSpinner.adapter = spinnerAdapter

        binding.sendButton.setOnClickListener {
            val selectedMountainId = getSelectedMountainId()
            val question = binding.questionInput.text.toString()

            if (selectedMountainId.isBlank() || question.isBlank()) {
                Toast.makeText(requireContext(), "Please select a mountain and fill the question", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                val response = try {
                    withContext(Dispatchers.IO) {
                        sendChatRequest(client, selectedMountainId, question)
                    }
                } catch (e: Exception) {
                    null // Handle network failure gracefully
                }

                val parsedResponse = parseResponse(response)
                binding.chatbotResponse.text = parsedResponse
            }
        }
    }

    private fun sendChatRequest(client: OkHttpClient, mountainId: String, question: String): String? {
        val url = "https://chatbot-dot-nusatinggi.et.r.appspot.com/chat"

        val jsonBody = JSONObject().apply {
            put("user_input", question)
            put("nomor_gunung", mountainId.toIntOrNull() ?: 0)
        }

        val requestBody = okhttp3.RequestBody.create(
            "application/json".toMediaTypeOrNull(),
            jsonBody.toString()
        )

        val request = Request.Builder()
            .url(url)
            .post(requestBody)
            .addHeader("Cookie", "nomor_gunung=$mountainId")
            .build()

        return try {
            val response: Response = client.newCall(request).execute()
            if (response.isSuccessful) {
                response.body?.string()
            } else {
                "Error: ${response.code} - ${response.message}"
            }
        } catch (e: Exception) {
            null // Return null if there is any exception
        }
    }

    private fun parseResponse(response: String?): String {
        return when {
            response == null -> "Failed to connect to server. Please try again."
            response.startsWith("Error") -> response
            else -> {
                try {
                    JSONObject(response).optString("response", "No response received")
                } catch (e: JSONException) {
                    "Invalid response format."
                }
            }
        }
    }

    private fun getSelectedMountainId(): String {
        val selectedPosition = binding.mountainSpinner.selectedItemPosition
        return mountainList[selectedPosition].second
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
