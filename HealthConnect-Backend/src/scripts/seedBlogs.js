const { sequelize } = require('../config/database');
const { Blog, BlogInteraction } = require('../models/Blog');
const User = require('../models/User');

async function seedBlogs() {
  try {
    console.log('Connecting to database for blog seeding...');
    await sequelize.authenticate();
    
    // Find any doctor
    const doctor = await User.findOne({ where: { role: 'doctor' } });
    
    if (!doctor) {
      console.error('❌ No doctor found in the database. Please run the main seed script first.');
      process.exit(1);
    }

    // Clear existing blogs and interactions (optional, but good for resetting demo data)
    await BlogInteraction.destroy({ where: {} });
    await Blog.destroy({ where: {} });

    console.log('Seeding blogs...');

    const blogsToCreate = [
      {
        authorId: doctor.id,
        title: 'Understanding Blood Pressure: The Silent Killer',
        content: `Blood pressure is a measure of the force that your heart uses to pump blood around your body. High blood pressure (hypertension) is often called a "silent killer" because it rarely causes symptoms. If left untreated, it increases your risk of serious problems such as heart attacks and strokes.

**What Causes High Blood Pressure?**
There isn't always a clear cause, but certain factors can increase your risk:
- Age: The risk increases as you get older.
- Family History: If your close relatives have hypertension, you might be at a higher risk.
- Lifestyle: A high-salt diet, lack of exercise, being overweight, smoking, and drinking too much alcohol can all contribute.

**How to Manage It**
1. **Eat a Healthy Diet:** Focus on fruits, vegetables, whole grains, and low-fat dairy. Reduce your sodium intake.
2. **Exercise Regularly:** Aim for at least 150 minutes of moderate aerobic activity every week.
3. **Maintain a Healthy Weight:** Losing even a small amount of weight if you're overweight can help reduce your blood pressure.
4. **Limit Alcohol and Quit Smoking:** Both of these can raise your blood pressure and damage your heart.
5. **Manage Stress:** Practice relaxation techniques like deep breathing, meditation, or yoga.

Always consult your doctor to find the best management plan for your specific situation. Don't wait for symptoms to appear; get your blood pressure checked regularly.`,
        coverImage: '/uploads/BloodPressure.png',
        tags: ['Heart Health', 'Wellness']
      },
      {
        authorId: doctor.id,
        title: 'The Importance of Good Posture in the Digital Age',
        content: `In today's digital world, many of us spend hours hunched over screens. This "tech neck" or poor posture can lead to a variety of health issues, ranging from chronic back pain to reduced lung capacity.

**Why Posture Matters**
Good posture isn't just about looking confident; it's essential for your physical health. Proper alignment ensures that your muscles and ligaments are working efficiently, reducing wear and tear on your joints.

**Common Problems Caused by Poor Posture**
- **Neck and Back Pain:** Slouching puts extra strain on your spine.
- **Headaches:** Tension in your neck and shoulders can lead to frequent tension headaches.
- **Digestive Issues:** Slouching can compress your abdominal organs, slowing down digestion.

**Tips for Better Posture**
1. **Ergonomic Workspace:** Ensure your computer monitor is at eye level and your chair supports your lower back.
2. **Take Breaks:** Stand up, stretch, and walk around every 30-60 minutes.
3. **Strengthen Core Muscles:** A strong core helps support your spine. Exercises like planks and yoga can be very beneficial.
4. **Mind Your Phone:** Bring your phone up to eye level instead of bending your neck down.

By making small adjustments to your daily habits, you can significantly improve your posture and overall well-being.`,
        coverImage: '/uploads/Posture.png',
        tags: ['Posture', 'Physical Therapy']
      },
      {
        authorId: doctor.id,
        title: '10 Healthy Habits for a Better Life',
        content: `Building a healthy lifestyle is a journey, not a destination. Incorporating simple, positive habits into your daily routine can have a profound impact on your physical and mental health.

**1. Stay Hydrated**
Drinking enough water is crucial for every system in your body. Aim for at least 8 glasses a day.

**2. Eat the Rainbow**
Include a variety of colorful fruits and vegetables in your diet to ensure you get a wide range of nutrients.

**3. Move Every Day**
You don't need a grueling workout every day. A brisk 30-minute walk can do wonders for your heart and mood.

**4. Prioritize Sleep**
Most adults need 7-9 hours of quality sleep per night. Establish a calming bedtime routine.

**5. Practice Gratitude**
Taking a moment each day to reflect on what you're thankful for can improve your mental outlook.

**6. Limit Screen Time**
Too much screen time can disrupt your sleep and increase stress. Unplug an hour before bed.

**7. Connect with Others**
Strong social connections are linked to a longer, happier life. Make time for friends and family.

**8. Learn Something New**
Keep your brain active by reading, taking a class, or trying a new hobby.

**9. Manage Stress**
Find healthy ways to cope with stress, such as meditation, deep breathing, or journaling.

**10. Regular Check-ups**
Don't skip your annual physicals. Preventative care is the best way to catch potential issues early.`,
        coverImage: '/uploads/10healthy.png',
        tags: ['Lifestyle', 'Mental Health']
      },
      {
        authorId: doctor.id,
        title: 'Managing Stress in a Fast-Paced World',
        content: `Stress is a natural physical and mental reaction to life experiences. However, chronic stress can wreak havoc on your health, affecting everything from your immune system to your sleep patterns.

**Recognizing the Signs of Stress**
- Physical: Headaches, muscle tension, fatigue, upset stomach.
- Emotional: Anxiety, irritability, lack of motivation, feeling overwhelmed.
- Behavioral: Overeating or undereating, social withdrawal, procrastination.

**Effective Stress Management Techniques**
1. **Identify Triggers:** Keep a journal to track what causes your stress and how you respond to it.
2. **Exercise:** Physical activity produces endorphins, which are natural mood lifters.
3. **Mindfulness and Meditation:** These practices help keep you grounded in the present moment, reducing anxiety about the future.
4. **Set Boundaries:** Learn to say no. You can't do everything, and it's okay to prioritize your own well-being.
5. **Seek Support:** Talk to a trusted friend, family member, or a professional counselor.

Remember, it's not about eliminating stress entirely, but learning how to manage it in a healthy way.`,
        coverImage: '/uploads/stress.png',
        tags: ['Mental Health', 'Wellness']
      }
    ];

    await Blog.bulkCreate(blogsToCreate);
    console.log('✅ Successfully seeded 4 demo blogs.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed blogs:', error);
    process.exit(1);
  }
}

seedBlogs();
