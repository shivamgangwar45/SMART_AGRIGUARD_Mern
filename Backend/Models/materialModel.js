import mongoose from "mongoose";

const materialSchema = mongoose.Schema(
  {
    materialName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      // Eco-friendly / Bio options add kiye gaye hain
      enum: [
        "Fertilizer",
        "Pesticide",
        "Herbicide",
        "Bio-Pesticide",
        "Organic Fertilizer",
        "Eco-Friendly Treatment",
      ],
    },
    diseaseUsage: [
      {
        type: String,
        enum: [
          "Plant Growth",
          "Insect Control",
          "Weed Killers",
          "Fungal Infection",
          "Bacterial Blight",
          "Soil Health",
        ],
      },
    ],
    usageInstructions: {
      type: String,
      required: true,
    },
    unitType: {
      type: String,
      required: true,
      enum: ["kg", "liters", "packs", "bottles"],
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    // 🏷️ Benefit 4: Cost savings on agricultural supplies
    originalPrice: {
      type: Number,
      default: null, // MRP price discount aur savings dikhane ke liye
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    // 🌿 Benefit 1: Access to eco-friendly plant treatments
    isEcoFriendly: {
      type: Boolean,
      default: false,
    },
    // 🛡️ Benefit 2: Reduced reliance on harmful pesticides
    toxicityLevel: {
      type: String,
      enum: ["Bio-Safe (Green)", "Moderate (Blue)", "Caution (Yellow)", "Hazardous (Red)"],
      default: "Bio-Safe (Green)",
    },
    // ⭐ Benefit 3: Expert-recommended products
    isExpertRecommended: {
      type: Boolean,
      default: false,
    },
    expertNotes: {
      type: String,
      default: "", // Agronomist ya specialist ki recommendation
    },
    supplierName: {
      type: String,
      required: true,
    },
    supplierContact: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    stockAvailable: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

export const Material = mongoose.model("Material", materialSchema);