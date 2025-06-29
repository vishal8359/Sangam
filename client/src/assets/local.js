import MySociety from "../pages/MySociety";
import lamp from "../assets/prodImages/lamp.jpg"
import lamp2 from "../assets/prodImages/lamp2.jpg"
import lamp3 from "../assets/prodImages/lamp3.jpg"

import vase from "../assets/prodImages/vase.jpg"
import vase2 from "../assets/prodImages/vase2.jpeg"
import vase3 from "../assets/prodImages/vase3.jpg"

import painting from "../assets/prodImages/wall_painting.jpg"
import painting2 from "../assets/prodImages/wall_painting2.jpg"
import painting3 from "../assets/prodImages/wall_painting3.jpg"

import basket1 from "../assets/prodImages/basket1.jpg"
import basket2 from "../assets/prodImages/basket2.jpg"

import clock1 from "../assets/prodImages/clock1.jpg"
import clock2 from "../assets/prodImages/clock2.jpg"

import diffuser1 from "../assets/prodImages/diffuser1.jpg"
import diffuser2 from "../assets/prodImages/diffuser2.jpg"
import diffuser3 from "../assets/prodImages/diffuser3.jpg"

import glass1 from "../assets/prodImages/glass1.jpg"
import glass2 from "../assets/prodImages/glass2.jpg"

import laundry1 from "../assets/prodImages/laundry1.jpg"
import laundry2 from "../assets/prodImages/laundry2.jpg"

import led1 from "../assets/prodImages/led1.jpg"
import led2 from "../assets/prodImages/led2.jpg"

import planter1 from "../assets/prodImages/planter1.jpg"
import planter2 from "../assets/prodImages/planter2.jpg"

import rug1 from "../assets/prodImages/rug1.jpg"
import rug2 from "../assets/prodImages/rug2.jpg"
import rug3 from "../assets/prodImages/rug3.jpg"

import shelf1 from "../assets/prodImages/shelf1.jpg"
import shelf2 from "../assets/prodImages/shelf2.jpg"

import stand1 from "../assets/prodImages/stand1.jpg"
import stand2 from "../assets/prodImages/stand2.jpg"

export const society = {
    name: "Green Valley Apartments",
    id: "GV-1234",
    address: "Sector 22, Dwarka, New Delhi",
    members: 58,
    admin: "Radhika Sharma",
    imageUrl: "./mySociety",

};
export const samplePolls = [
  {
    id: 1,
    question: "Who should be the next society president?",
    logo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    type: "multiple",
    options: [
      { name: "Mr. Sharma", votes: 61 },
      { name: "Ms. Rani", votes: 90 },
      { name: "Mr. Khan", votes: 30 },
    ],
    locked: false,
    votedHouses: new Set(),
  },
  {
    id: 2,
    question: "Which area needs renovation first?",
    logo: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
    type: "single",
    options: [
      { name: "Playground Management", votes: 120 },
      { name: "Lift Area", votes: 150 },
      { name: "Parking", votes: 70 },
    ],
    locked: true,
    votedHouses: new Set(["House A"]),
  },
];

export const productsFromSociety = [
  {
    id: 1,
    name: 'Wooden Chair',
    price: '₹800',
    image: 'https://source.unsplash.com/random/200x200?chair',
    description: 'Solid teakwood chair in excellent condition.',
  },
  {
    id: 2,
    name: 'Microwave Oven',
    price: '₹1200',
    image: 'https://source.unsplash.com/random/200x200?microwave',
    description: 'Hardly used, 20L capacity.',
  },
];

export const productsFromNeighbours = [
  {
    id: 3,
    name: 'Study Table',
    price: '₹1500',
    image: 'https://source.unsplash.com/random/200x200?table',
    description: 'Spacious and durable study table.',
  },
  {
    id: 4,
    name: 'Refrigerator',
    price: '₹5000',
    image: 'https://source.unsplash.com/random/200x200?refrigerator',
    description: 'Double door fridge, 260L.',
  },
];
// Severe conditions list
export const SEVERE_CONDITIONS = [
  "Heart Disease",
  "Cancer",
  "Chronic Kidney",
  "Severe Diabetes",
];

export const dummyGroups = ["Chai Group", "Mandir Group", "Festival Team"];

export const dummyMessages = [
  { id: 1, sender: "self", content: "Hey everyone!" },
  { id: 2, sender: "other", content: "Hello! What’s up?" },
  { id: 3, sender: "self", content: "Shall we plan a chai meetup?" },
  {
    id: 4,
    sender: "group",
    group: "Chai Group",
    senderName: "Radha",
    content: "Yes please!",
  },
  {
    id: 5,
    sender: "group",
    group: "Mandir Group",
    senderName: "Suresh",
    content: "Join aarti at 7!",
  },
];

export const dummyProducts = [
  {
    _id: "1",
    name: "Handmade Vase",
    price: 699,
    offerPrice: 499,
    image: [vase, vase2, vase3],
    category: "Decor",
    rating: 4.3,
    reviews: 4,
    sellerName: "Rita Arts",
    sellerAddress: "101, Maple Lane, Pune",
    description: [
      "Elegant ceramic vase with a matte finish",
      "Perfect for fresh flowers or dried arrangements",
      "Handcrafted with traditional pottery techniques",
      "Durable and water-resistant build",
      "Adds charm to any living space or shelf"
    ],
  },
  {
    _id: "2",
    name: "Wall Painting",
    price: 999,
    offerPrice: 799,
    image: [painting2, painting, painting3],
    category: "Decor",
    rating: 4.1,
    reviews: 4,
    sellerName: "Kala Studio",
    sellerAddress: "Sector 12, Noida",
    description: [
      "High-quality canvas print with vibrant colors",
      "Abstract art inspired by modern Indian themes",
      "Ready to hang with attached hooks",
      "UV-resistant coating to prevent fading",
      "Ideal for living rooms, hallways, or offices"
    ],
  },
  {
    _id: "3",
    name: "Wooden Lamp",
    price: 1499,
    offerPrice: 1299,
    image: [lamp2, lamp, lamp3],
    category: "Lighting",
    rating: 4.5,
    reviews: 4,
    sellerName: "WoodWorks",
    sellerAddress: "MG Road, Bengaluru",
    description: [
      "Eco-friendly table lamp made from reclaimed wood",
      "Warm ambient lighting with soft glow effect",
      "Minimalist design blends with any decor",
      "Fitted with energy-saving LED bulb",
      "Perfect for bedside tables or study desks"
    ],
  },
  {
    _id: "4",
    name: "Handwoven Jute Rug",
    price: 2599,
    offerPrice: 1999,
    image: [rug1, rug2, rug3],
    category: "Flooring",
    rating: 4.3,
    reviews: 11,
    sellerName: "EcoDecor",
    sellerAddress: "Connaught Place, Delhi",
    description: [
      "Handwoven from 100% natural jute fibers",
      "Adds rustic warmth to living spaces",
      "Durable and biodegradable",
      "Low-maintenance and easy to clean",
      "Ideal for living rooms, patios, and hallways",
    ],
  },
  {
    _id: "5",
    name: "Terracotta Planter",
    price: 699,
    offerPrice: 499,
    image: [planter1, planter2],
    category: "Gardening",
    rating: 4.6,
    reviews: 9,
    sellerName: "GreenCorner",
    sellerAddress: "Baner, Pune",
    description: [
      "Eco-friendly terracotta material",
      "Hand-painted with tribal patterns",
      "Porous structure ensures better aeration",
      "Ideal for indoor herbs and succulents",
      "Drainage hole to prevent overwatering",
    ],
  },
  {
    _id: "6",
    name: "Smart Aroma Diffuser",
    price: 1899,
    offerPrice: 1499,
    image: [diffuser1, diffuser2, diffuser3],
    category: "Wellness",
    rating: 4.8,
    reviews: 22,
    sellerName: "ZenMist",
    sellerAddress: "Gachibowli, Hyderabad",
    description: [
      "Ultrasonic mist with essential oil support",
      "Built-in LED mood lighting",
      "Auto shut-off when water runs out",
      "Covers up to 300 sq ft room space",
      "Whisper-quiet operation for peaceful sleep",
    ],
  },
  {
    _id: "7",
    name: "Vintage Wall Clock",
    price: 1299,
    offerPrice: 999,
    image: [clock1, clock2],
    category: "Wall Art",
    rating: 4.1,
    reviews: 13,
    sellerName: "Timeless Decor",
    sellerAddress: "Park Street, Kolkata",
    description: [
      "Rustic wood finish with Roman numerals",
      "Quartz movement with silent sweep",
      "Battery-operated and lightweight",
      "Adds antique charm to interiors",
      "Easy to mount with rear hook",
    ],
  },
  {
    _id: "8",
    name: "Bamboo Laptop Stand",
    price: 1499,
    offerPrice: 1199,
    image: [stand1, stand2],
    category: "Furniture",
    rating: 4.5,
    reviews: 16,
    sellerName: "WorkWell",
    sellerAddress: "Koramangala, Bengaluru",
    description: [
      "Ergonomic design for better posture",
      "Sustainable bamboo construction",
      "Ventilated surface for cooling",
      "Foldable and portable design",
      "Ideal for remote work and study",
    ],
  },
  {
    _id: "9",
    name: "Rattan Storage Basket",
    price: 999,
    offerPrice: 799,
    image: [basket1, basket2],
    category: "Storage",
    rating: 4.2,
    reviews: 8,
    sellerName: "NeatNest",
    sellerAddress: "Sector 21, Noida",
    description: [
      "Handwoven rattan with cotton liner",
      "Perfect for toys, laundry, or books",
      "Lightweight yet durable design",
      "Natural look suits all decor styles",
      "Includes handles for easy movement",
    ],
  },
  {
    _id: "10",
    name: "Recycled Glass Vase",
    price: 899,
    offerPrice: 699,
    image: [glass1, glass2],
    category: "Decor",
    rating: 4.4,
    reviews: 14,
    sellerName: "GlassRoots",
    sellerAddress: "Banjara Hills, Hyderabad",
    description: [
      "Made from 100% recycled glass",
      "Iridescent finish with narrow neck",
      "Eco-conscious and artistic statement",
      "Suitable for fresh or artificial flowers",
      "Handcrafted and one-of-a-kind",
    ],
  },
  {
    _id: "11",
    name: "LED Strip Lights",
    price: 1299,
    offerPrice: 999,
    image: [led1, led2],
    category: "Lighting",
    rating: 4.7,
    reviews: 19,
    sellerName: "BrightSpace",
    sellerAddress: "Civil Lines, Jaipur",
    description: [
      "16 million colors with remote control",
      "Can sync with music and voice control",
      "USB and wall socket compatible",
      "Flexible and cuttable for custom fit",
      "Great for gaming setups and bedrooms",
    ],
  },
  {
    _id: "12",
    name: "Handcrafted Wooden Shelf",
    price: 2499,
    offerPrice: 1999,
    image: [shelf1, shelf2],
    category: "Furniture",
    rating: 4.3,
    reviews: 12,
    sellerName: "CraftNest",
    sellerAddress: "Alambagh, Lucknow",
    description: [
      "Wall-mounted shelf made from reclaimed teak",
      "Three-tier design for space efficiency",
      "Rustic finish suits modern and classic homes",
      "Pre-assembled and ready to hang",
      "Supports up to 20kg of weight",
    ],
  },
  {
    _id: "13",
    name: "Canvas Laundry Hamper",
    price: 799,
    offerPrice: 599,
    image: [laundry1, laundry2],
    category: "Storage",
    rating: 4.0,
    reviews: 6,
    sellerName: "UrbanLiving",
    sellerAddress: "Anna Nagar, Chennai",
    description: [
      "Collapsible design for easy storage",
      "Waterproof lining and strong base",
      "Neutral tones match any bedroom",
      "Drawstring closure to keep clothes hidden",
      "Sturdy handles for easy carrying",
    ],
  },
];
