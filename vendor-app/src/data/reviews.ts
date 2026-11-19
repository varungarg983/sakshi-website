// Sakshi's real Google reviews, copied word for word. Add new ones to the list.
// The order here is the default order on the page (strongest seller reviews first).
//
// role:      'seller' or 'buyer' (leave out if the review doesn't say)
// industry:  one of the keys in INDUSTRIES (content.ts), e.g. 'cafe', 'cleaning'; 'other' if unknown
// situation: optional, one of the keys in SITUATIONS (content.ts), e.g. 'retiring'
// name:      as shown on Google, shortened to first name and last initial
// pull:      one sentence copied from the review, shown large
// photo:     optional photo of the reviewer (only with their permission), a file in public/photos/reviews/, e.g. 'sunny.webp'

import type { Industry, Situation } from './content'

export type Review = {
  name: string
  // A sentence from the review, word for word, for the large quote display
  pull: string
  role?: 'seller' | 'buyer'
  industry: Industry
  situation?: Situation
  rating: number
  text: string
  photo?: string
}

export const REVIEWS: Review[] = [
  {
    name: 'Sumit G.',
    pull: 'Her clear and responsive communication made a huge difference, and I loved how she moved everything forward at a great pace.',
    role: 'seller',
    industry: 'other',
    rating: 5,
    text: "I'm still beaming with satisfaction after selling my business with Sakshi's expert guidance. Her clear and responsive communication made a huge difference, and I loved how she moved everything forward at a great pace. We had a fantastic experience, especially with the impressive results she achieved - she found a buyer in just the first week after taking over from another agent. I'm so grateful for her professionalism, and I'd wholeheartedly suggest anyone looking to sell their business give Sakshi a call - she truly delivers!",
  },
  {
    name: 'Sunny',
    pull: 'From start to finish, she was very honest, clear, and always kept us updated.',
    role: 'seller',
    industry: 'other',
    rating: 5,
    text: 'I had an amazing experience working with Clytha Macleod and especially with our Business Broker Sakshi Aggarwal.\n\nSakshi sold our business with full dedication and professionalism. From start to finish, she was very honest, clear, and always kept us updated. She understands the whole process so well and made everything feel easy and stress-free for us.\n\nWe are really thankful to her and the whole Clytha Macleod team for their hard work and support.\n\nIf you are thinking to sell or buy a business, I would highly recommend you contact Sakshi Aggarwal. You will be in the best hands!\n\nThank you Sakshi',
  },
  {
    name: 'Sapan P.',
    pull: 'Selling a business can feel overwhelming but her calm guidance and clear communication made everything far easier than we expected.',
    role: 'seller',
    industry: 'other',
    rating: 5,
    text: 'We recently sold our business and were extremely impressed with the support Sakshi provided throughout the entire process. She was knowledgeable, proactive and consistently kept us informed at every stage. Selling a business can feel overwhelming but her calm guidance and clear communication made everything far easier than we expected. We are grateful for her professionalism and would happily recommend her to anyone considering a Sale.',
  },
  {
    name: 'Paul P.',
    pull: 'She made what could have been a complex process look incredibly easy and stress-free.',
    industry: 'cafe',
    rating: 5,
    text: 'Working with Sakshi Agarwal from start to finish on this business has been an absolute pleasure. Throughout the entire process of getting the deal over the line for Ed’s Cafe, her communication was nothing short of exceptional. She kept us constantly updated on our progress, ensuring I always knew exactly where things stood.\nWhat really stood out was how seamlessly she managed the transition and handshake between the vendors and the landlords. she made what could have been a complex process look incredibly easy and stress-free.\nSakshi is professional, proactive, and truly dedicated to her clients. We cannot recommend her highly enough to anyone looking for a top-tier professional, and I look forward to working on many more deals with her in the future!',
  },
  {
    name: 'Mak B.',
    pull: 'Her clear and responsive communication was invaluable, especially given the confidentiality required throughout the process.',
    role: 'buyer',
    industry: 'other',
    rating: 5,
    text: "Buying a business can be overwhelming, but our experience with Sakshi Aggarwal at Clyth McLeod in Auckland was truly stress-free. Her clear and responsive communication was invaluable, especially given the confidentiality required throughout the process. We felt guided every step of the way, thanks to her honesty, transparency, and deep knowledge of the NZ business market. If you're looking for a business broker who truly understands the local market, look no further - we're so grateful for Sakshi's expertise and would absolutely endorse her to anyone considering buying or selling a business.",
  },
  {
    name: 'Yashraj N.',
    pull: 'She is trustworthy, reliable, and simply amazing at what she does.',
    industry: 'other',
    rating: 5,
    text: 'Sakshi was always available to answer my questions, explained everything clearly, and made the whole process smooth and stress-free.\nI appreciate her dedication and hard work. If anyone is looking to buy or sell a business, I would recommend Sakshi. She is trustworthy, reliable, and simply amazing at what she does.',
  },
  {
    name: 'Pardeep G.',
    pull: 'From the beginning, they were extremely helpful, honest, and transparent.',
    industry: 'other',
    rating: 5,
    text: 'I had a fantastic experience working with Sakshi Aggarwal.\nFrom the beginning, they were extremely helpful, honest, and transparent. Their knowledge of the market and attention to detail really stood out. They guided me through every step and made sure everything was handled perfectly. I truly appreciate their hard work and would definitely recommend them to others.',
  },
  {
    name: 'Ravinder S.',
    pull: 'She was being really honest and always there to answer any queries we had.',
    role: 'buyer',
    industry: 'other',
    rating: 5,
    text: 'we have been dealing with Sakshi in our recent business purchase and she was being really honest and always there to answer any queries we had, overall a very positive experience',
  },
  {
    name: 'Massey Foodmart',
    pull: 'I really appreciate how available and responsive you’ve been whenever I needed clarification.',
    industry: 'retail',
    rating: 5,
    text: 'Hi Sakshi,\n\nThank you so much for your support throughout. You’ve been very helpful in answering all my questions, and I really appreciate how available and responsive you’ve been whenever I needed clarification. It’s been a pleasure dealing with you.',
  },
  {
    name: 'Minku G.',
    pull: 'She was very professional and incredibly knowledgeable.',
    industry: 'other',
    rating: 5,
    text: 'Very grateful that I met with Sakshi. I had an absolutely fantastic experience working with her. From the beginning, she was very professional and incredibly knowledgeable.',
  },
  {
    name: 'Aman T.',
    pull: 'Very professional, got job done really quickly.',
    industry: 'other',
    rating: 5,
    text: 'very Professional, got job done really quickly thank you',
  },
]
