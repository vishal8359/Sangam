import MySociety from "../pages/MySociety";

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