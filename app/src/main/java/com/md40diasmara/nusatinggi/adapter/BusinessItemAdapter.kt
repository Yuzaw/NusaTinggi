package com.md40diasmara.nusatinggi.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.md40diasmara.nusatinggi.Product
import com.md40diasmara.nusatinggi.R

class BusinessItemAdapter(
    private var products: List<Product>,
    private val listener: OnBusinessItemClickListener
) : RecyclerView.Adapter<BusinessItemAdapter.BusinessProductViewHolder>() {

    interface OnBusinessItemClickListener {
        fun onEditClick(product: Product) // Handle edit button click
        fun onDeleteClick(product: Product) // Handle delete button click
    }

    class BusinessProductViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val productImage: ImageView = view.findViewById(R.id.img_product)
        val productTitle: TextView = view.findViewById(R.id.title_product)
        val productPrice: TextView = view.findViewById(R.id.price_product)
        val btnEdit: ImageButton = itemView.findViewById(R.id.btn_edit)
        val btnDelete: ImageButton = itemView.findViewById(R.id.btn_delete)

    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BusinessProductViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_business_product, parent, false)
        return BusinessProductViewHolder(view)
    }

    override fun onBindViewHolder(holder: BusinessProductViewHolder, position: Int) {
        val product = products[position]
        holder.productTitle.text = product.title
        holder.productPrice.text = "Rp ${product.price}"

        Glide.with(holder.itemView.context)
            .load(product.image)
            .into(holder.productImage)

        // Set click listeners for Edit and Delete buttons
        holder.btnEdit.setOnClickListener {
            listener.onEditClick(product)
        }

        holder.btnDelete.setOnClickListener {
            listener.onDeleteClick(product)
        }
    }

    override fun getItemCount(): Int = products.size

    fun updateData(newProducts: List<Product>) {
        products = newProducts
        notifyDataSetChanged()
    }
}
