package com.md40diasmara.nusatinggi.ui.splash

import android.content.Intent
import android.os.Bundle
import android.view.animation.AnimationUtils
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import com.md40diasmara.nusatinggi.LoginActivity
import com.md40diasmara.nusatinggi.R
import kotlinx.coroutines.*

class SplashActivity : AppCompatActivity() {

    private val splashTime = 2500L // Waktu splashscreen (2.5 detik)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        val logo: ImageView = findViewById(R.id.splash_logo)

        // Load Animasi
        val fadeIn = AnimationUtils.loadAnimation(this, R.anim.fade_in)
        val slideUp = AnimationUtils.loadAnimation(this, R.anim.slide_up)

        // Mulai animasi
        logo.startAnimation(fadeIn)

        // Tunda untuk menampilkan animasi
        GlobalScope.launch {
            delay(splashTime)
            withContext(Dispatchers.Main) {
                // Mulai activity tujuan
                startActivity(Intent(this@SplashActivity, LoginActivity::class.java))
                finish()
            }
        }
    }
}

