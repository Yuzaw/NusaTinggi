package com.md40diasmara.nusatinggi.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.md40diasmara.nusatinggi.R

class JumbotronAdapter(private val imagePaths: List<String>) : RecyclerView.Adapter<JumbotronAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val imageView: ImageView = view.findViewById(R.id.imageView)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_jumbotron, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        // Memuat gambar menggunakan Glide
        Glide.with(holder.itemView.context)
            .load(imagePaths[position]) // `imagePaths` berisi URL atau nama file lokal
            .into(holder.imageView)
    }

    override fun getItemCount(): Int = imagePaths.size
}
