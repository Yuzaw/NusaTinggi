package com.md40diasmara.nusatinggi

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import java.util.UUID

@Parcelize
data class Product(
    val id: String,
    val title: String,
    val description: String,
    val price: Float,
    val rating: Float,
    val image: String?,
    val jumlahRating: Int,
    val jumlahPembeli: Int
)
: Parcelable

data class ProductResponse(
    val error: Boolean,
    val message: String,
    val listProducts: List<Product>
)
