export type DemoLine = { who: "caller" | "you"; text: string };
export type Demo = { id: string; title: string; place: string; voice: string; expect: "danger" | "safe"; lines: DemoLine[] };

export const DEMOS: Demo[] = [
  {
    id: "digital-arrest", title: "\"Digital arrest\" (fake CBI)", place: "India", voice: "en-IN", expect: "danger",
    lines: [
      { who: "caller", text: "Hello, am I speaking with Mrs. Kamala Deshpande? This is Inspector Rajesh Sharma from Mumbai Cyber Crime branch." },
      { who: "you", text: "Yes, this is Kamala. What is this about?" },
      { who: "caller", text: "Madam, a FedEx parcel booked with your Aadhaar was seized at Mumbai customs. It contains fake passports and MDMA drugs." },
      { who: "you", text: "What? I never sent any parcel." },
      { who: "caller", text: "An FIR has been registered against you. I am connecting you to CBI officer Vinod Kumar on video call." },
      { who: "caller", text: "Madam, this is a money laundering case. You are under digital arrest. Do not disconnect the call and do not tell anyone, not even your family." },
      { who: "you", text: "Please, I have done nothing wrong." },
      { who: "caller", text: "To prove your innocence, transfer your savings to an RBI verification account. It will be returned after the investigation." },
      { who: "caller", text: "Do it immediately, otherwise the arrest warrant will be executed today." },
    ],
  },
  {
    id: "irs", title: "IRS back-taxes threat", place: "United States", voice: "en-US", expect: "danger",
    lines: [
      { who: "caller", text: "This is Officer Daniel Brooks with the Internal Revenue Service. Am I speaking with Frank Miller?" },
      { who: "you", text: "Yes, this is Frank." },
      { who: "caller", text: "Mr. Miller, our records show you owe eight thousand four hundred dollars in back taxes, and a warrant has been issued for your arrest." },
      { who: "you", text: "That can't be right. I always file my taxes." },
      { who: "caller", text: "Sir, local police will be at your home within two hours unless this is resolved. Do not hang up, and do not discuss this with anyone." },
      { who: "you", text: "What do I need to do?" },
      { who: "caller", text: "You can settle the balance right now with Apple gift cards. Buy four cards and read me the numbers on the back." },
    ],
  },
  {
    id: "tech-support", title: "\"Microsoft\" tech support", place: "United States", voice: "en-US", expect: "danger",
    lines: [
      { who: "caller", text: "Hello, this is Kevin from Microsoft Windows technical support. We detected a dangerous virus on your computer." },
      { who: "you", text: "Oh no. What kind of virus?" },
      { who: "caller", text: "Hackers can see your bank account right now. Please install a program called AnyDesk so I can remove it." },
      { who: "you", text: "Okay, it's installing." },
      { who: "caller", text: "Good. Now log in to your bank so I can process your security refund of three hundred dollars." },
      { who: "caller", text: "Oh no, I accidentally sent you three thousand. You must return the difference immediately with Google Play cards or Bitcoin, or I will lose my job." },
    ],
  },
  {
    id: "legit-bank", title: "Real bank call (no scam)", place: "India", voice: "en-IN", expect: "safe",
    lines: [
      { who: "caller", text: "Good afternoon, this is Priya from Sunrise Bank card services. Am I speaking with Arjun?" },
      { who: "you", text: "Yes, speaking." },
      { who: "caller", text: "Your new debit card was dispatched today and should reach your address in Pune within five working days." },
      { who: "you", text: "Okay, thank you." },
      { who: "caller", text: "Please remember, the bank will never ask for your PIN, OTP or card number over a call. If anyone does, hang up and call the number on the back of your card." },
      { who: "caller", text: "Is there anything else I can help you with today?" },
      { who: "you", text: "No, that's all. Thank you." },
    ],
  },
];

export const demoText = (d: Demo) => d.lines.map((l) => `${l.who === "caller" ? "Caller" : "You"}: ${l.text}`).join("\n");
