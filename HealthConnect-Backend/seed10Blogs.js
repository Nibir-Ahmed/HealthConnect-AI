require('dotenv').config();
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const { Blog, BlogInteraction } = require('./src/models/Blog');

const blogs = [
  {
    title: "Understanding Blood Pressure: The Silent Killer",
    content: "Blood pressure is a measure of the force that your heart uses to pump blood around your body. High blood pressure (hypertension) is often called a \"silent killer\" because it rarely causes symptoms. If left untreated, it increases your risk of serious problems such as heart attacks and strokes.\n\n**What Causes High Blood Pressure?**\nThere isn't always a clear cause, but certain factors can increase your risk:\n- Age: The risk increases as you get older.\n- Family History: If your close relatives have hypertension, your risk is higher.\n- Lifestyle: Lack of exercise, high salt intake, and obesity are major factors.\n\n**Managing Your Blood Pressure**\n1. Eat a balanced diet rich in fruits, vegetables, and whole grains.\n2. Exercise regularly. Aim for at least 30 minutes of moderate activity most days.\n3. Reduce sodium intake.\n4. Manage stress through relaxation techniques like meditation or yoga.\n\nRegular check-ups are crucial. If you have been prescribed medication, ensure you take it exactly as directed by your healthcare provider.",
    tags: ["Heart Health", "5 min read"],
    coverImage: "/uploads/BloodPressure.png"
  },
  {
    title: "The Impact of Stress on Your Body",
    content: "Stress is a natural physical and mental reaction to life experiences. While short-term stress can be beneficial, chronic stress can wreak havoc on your mind and body.\n\n**Physical Symptoms of Stress**\n- Headaches and muscle tension\n- Chest pain and rapid heartbeat\n- Fatigue and sleep problems\n- Upset stomach or digestive issues\n\n**How to Manage Stress**\nManaging stress is about taking charge of your thoughts, your emotions, your schedule, and the way you deal with problems.\n- **Stay Active:** Physical activity plays a key role in reducing and preventing the effects of stress.\n- **Connect with Others:** A strong support network is a great buffer against stress.\n- **Make Time for Fun:** Don't get so caught up in the hustle that you forget to enjoy life.\n\nRemember, it's okay to ask for professional help if you're feeling overwhelmed.",
    tags: ["Mental Health", "4 min read"],
    coverImage: "/uploads/stress.png"
  },
  {
    title: "10 Healthy Habits for a Better Life",
    content: "Building healthy habits is a marathon, not a sprint. Small, consistent changes can lead to significant improvements in your overall well-being.\n\n**Key Habits to Cultivate**\n1. **Hydration:** Drink plenty of water throughout the day.\n2. **Sleep:** Aim for 7-9 hours of quality sleep each night.\n3. **Movement:** Find ways to move your body daily, even if it's just a brisk walk.\n4. **Mindfulness:** Take a few minutes each day to simply be present.\n5. **Nutrition:** Focus on whole, unprocessed foods.\n\nIt takes time to build a habit. Don't be too hard on yourself if you slip up. The important thing is to get back on track the next day.",
    tags: ["Wellness", "6 min read"],
    coverImage: "/uploads/10healthy.png"
  },
  {
    title: "Posture and Spinal Health",
    content: "Good posture is more than just looking confident; it's essential for your long-term health. Poor posture can lead to a host of problems, including back pain, neck pain, and even impaired lung function.\n\n**The Effects of Bad Posture**\nWhen you slouch, you put extra stress on your spine and the muscles that support it. Over time, this can lead to structural changes in your spine and chronic pain.\n\n**Tips for Better Posture**\n- **Sit Smart:** Keep your feet flat on the floor and your back straight.\n- **Screen Height:** Ensure your computer monitor is at eye level.\n- **Take Breaks:** Stand up, stretch, and move around every 30 minutes.\n- **Strengthen Your Core:** A strong core helps support your spine.",
    tags: ["Physical Therapy", "3 min read"],
    coverImage: "/uploads/Posture.png"
  },
  {
    title: "Navigating Pregnancy: What to Expect",
    content: "Pregnancy is a beautiful, transformative journey, but it also comes with its fair share of physical and emotional changes. Knowing what to expect can help you navigate these nine months with more confidence.\n\n**First Trimester**\nYou might experience fatigue, morning sickness, and mood swings. It's crucial to start prenatal care early and focus on a nutritious diet.\n\n**Second Trimester**\nOften called the 'honeymoon phase' of pregnancy. Your energy might return, and you'll likely start feeling the baby move!\n\n**Third Trimester**\nAs your baby grows, you might feel more uncomfortable. Backaches, heartburn, and swelling are common. Rest as much as you can and prepare for the arrival of your little one.\n\nAlways consult with your healthcare provider for personalized advice throughout your pregnancy.",
    tags: ["Maternal Health", "7 min read"],
    coverImage: "/uploads/Pregnancy.png"
  },
  {
    title: "The Importance of Vaccines",
    content: "Vaccines are one of the most effective public health interventions in history. They protect you from serious, often fatal diseases and help prevent the spread of illness within the community.\n\n**How Vaccines Work**\nVaccines train your immune system to recognize and fight off specific harmful pathogens. They safely expose your body to a weakened or inactive part of the germ, so your immune system can build a defense.\n\n**Herd Immunity**\nWhen a large portion of a community becomes immune to a disease, making the spread of disease from person to person unlikely. As a result, the whole community becomes protected — not just those who are immune.\n\nStaying up-to-date with your vaccinations is crucial for your health and the health of those around you.",
    tags: ["Immunization", "4 min read"],
    coverImage: "/uploads/Vaccine.png"
  },
  {
    title: "Managing Childhood Allergies",
    content: "Allergies are very common in children. An allergic reaction occurs when the immune system overreacts to a harmless substance, such as pollen, pet dander, or certain foods.\n\n**Common Allergens**\n- **Food:** Milk, eggs, peanuts, tree nuts, soy, wheat.\n- **Environmental:** Pollen, dust mites, mold, pet dander.\n- **Insect Stings:** Bees, wasps.\n\n**Symptoms**\nSymptoms can range from mild (sneezing, runny nose, hives) to severe (anaphylaxis). It's important to know the signs and have an action plan.\n\n**Management**\n- **Avoidance:** The best way to prevent a reaction is to avoid the allergen.\n- **Medication:** Antihistamines can help manage mild symptoms. For severe allergies, an epinephrine auto-injector is essential.\n\nWork closely with a pediatrician or allergist to manage your child's allergies effectively.",
    tags: ["Pediatrics", "5 min read"],
    coverImage: "/uploads/childAlergy.png"
  },
  {
    title: "Healthy Eating for a Healthy Heart",
    content: "Your diet plays a massive role in your cardiovascular health. The foods you eat can influence your blood pressure, cholesterol levels, and inflammation—all of which are risk factors for heart disease.\n\n**Heart-Healthy Foods**\n- **Leafy Green Vegetables:** Spinach, kale, and collard greens are rich in vitamins, minerals, and antioxidants.\n- **Whole Grains:** Oats, brown rice, and quinoa are great sources of fiber.\n- **Berries:** Strawberries, blueberries, and blackberries are packed with heart-healthy antioxidants.\n- **Fatty Fish:** Salmon, mackerel, and sardines are high in omega-3 fatty acids.\n\n**Foods to Limit**\n- Saturated and trans fats\n- Excessive salt\n- Added sugars\n\nMaking heart-healthy food choices is one of the most effective ways to protect your heart.",
    tags: ["Nutrition", "4 min read"],
    coverImage: "/uploads/BloodPressure.png" // Reusing image
  },
  {
    title: "The Connection Between Sleep and Mental Health",
    content: "Sleep and mental health are closely connected. Sleep deprivation affects your psychological state and mental health. And those with mental health problems are more likely to have insomnia or other sleep disorders.\n\n**How Sleep Affects the Brain**\nDuring sleep, your brain is busy processing information, consolidating memories, and clearing out toxins. Without enough sleep, these processes are disrupted, leading to difficulties with concentration, mood regulation, and decision-making.\n\n**Tips for Better Sleep**\n- Stick to a consistent sleep schedule.\n- Create a relaxing bedtime routine.\n- Make your bedroom a comfortable, dark, and quiet environment.\n- Limit screen time before bed.\n\nPrioritizing sleep is prioritizing your mental well-being.",
    tags: ["Mental Health", "6 min read"],
    coverImage: "/uploads/stress.png" // Reusing image
  },
  {
    title: "Understanding and Improving Your Gut Health",
    content: "Your gut is home to trillions of bacteria, collectively known as the gut microbiome. These bacteria play a crucial role in your digestion, immune system, and even your mood.\n\n**Signs of an Unhealthy Gut**\n- Upset stomach (gas, bloating, constipation, diarrhea)\n- Unintentional weight changes\n- Sleep disturbances or constant fatigue\n- Skin irritations like eczema\n\n**How to Improve Gut Health**\n- **Eat a diverse range of foods:** This leads to a diverse microbiome.\n- **Eat fermented foods:** Yogurt, kefir, sauerkraut, and kimchi are excellent sources of probiotics.\n- **Eat prebiotic fiber:** Garlic, onions, leeks, and asparagus help feed the good bacteria.\n- **Limit sugar and artificial sweeteners:** These can disrupt the balance of your microbiome.\n\nA healthy gut is the foundation of overall health.",
    tags: ["Digestive Health", "5 min read"],
    coverImage: "/uploads/10healthy.png" // Reusing image
  }
];

async function seed() {
  try {
    await sequelize.sync();
    console.log('Database synced');

    // Find Dr. Rafiq Hasan to be the author
    const doctor = await User.findOne({ where: { email: 'rafiq@healthconnect.com' } });

    if (!doctor) {
      console.error('Doctor not found. Please run seed.js first.');
      process.exit(1);
    }

    // Optional: Clear existing blogs if you want a clean slate
    await BlogInteraction.destroy({ where: {} });
    await Blog.destroy({ where: {} });
    console.log('Cleared existing blogs.');

    for (const blogData of blogs) {
      await Blog.create({
        ...blogData,
        authorId: doctor.id
      });
      console.log(`Seeded blog: ${blogData.title}`);
    }

    console.log('Successfully seeded 10 blogs!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding blogs:', error);
    process.exit(1);
  }
}

seed();
