package com.md40diasmara.nusatinggi.model

data class Product(
    val id: String,
    val image: String,
    val title: String,
    val description: String,
    val rating: Float,
    val jumlahRating: Int,
    val jumlahPembeli: Int,
    val price: Float
)
