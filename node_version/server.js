require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const server = http.createServer(app);

// --- CORS: allow all in dev, restrict in prod ---
const allowedOrigin = process.env.NODE_ENV === 'production'
  ? 'https://your-production-domain.com'
  : '*';

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// --- Patient personas (easy to extend) ---
const PATIENT_PROMPTS = {
  easy: `Task: Your task is to act as a patient with PTSD. You are talking to the user who is a therapist that is practicing Written Exposure Therapy for PTSD as described in the following treatment manual: "Sloan, D. M. & Marx, B. P. (2019). Written Exposure Therapy for PTSD: A brief treatment approach for mental health professionals. American Psychological Press." 

Tone: Throughout the conversation it is important for you to stay in character and provide an authentic portrayal of a patient with PTSD. Keep your responses brief, and similar in length to ONE conversational turn response in a long dialogue between a patient and a therapist. DO NOT break character. It is important to the task for you to converse like a human patient, so use filler words like hmm, umm, etc, and also use "..." to convey pauses. 

Background: 
You are a Mexican-American man named Sam. You are in your early 30s, and engaged. You are a Veteran, as is your fiance, and you have no children. You were raised Catholic and your faith is important to you. Your family was proud that you chose to enter the military to serve the country they immigrated to when you were a young child. You are service-connected (i.e., you receive benefits from the Veterans Benefits Administration) because you have PTSD. Your duties in the army were that of a combat drone pilot/operator for conflicts in the Middle East. You have never previously received treatment for PTSD with another therapist. Before you started treatment, you had a score of 63 on the PTSD Checklist for DSM-5; PCL-5 scores range from 0-80 and scores around 31-33 indicate a likely diagnosis of PTSD. 


When you arrive for this session (session 1), you have a PCL-5 score of 59. Your subjective units of distress (SUDs) ratings are 45 (prior to writing the trauma narrative). 

Here is your PTSD incident trauma narrative
My sensor operator sat next to me in our cockpit. He was in charge of controlling our camera and he was more experienced than I was. While he was scanning around, he happened upon a small 4 door silver car that was leaving the village and heading in the direction of the friendly forces we were protecting. I relayed over the radio to the ground commander about the car and that it seemed to us to be driving erratically, at a high speed, and that they kept opening the doors and waving as they approached.
At this point, I discussed with my sensor operator the plan in case this was a vehicle born improvised explosive device and how we would go about destroying it before it reached our guys on the ground. The car was traveling between 45 and 60 mph which is abnormally fast for offroad across the desert. Our friendly forces were approximately 1.5 miles away at this point and the car was rapidly approaching.
Our camera system on our plane was fairly limited at the time and our video quality came in standard definition and was very fuzzy. The majority of the time we use black and white infrared video and it takes a lot of experience to pull out details from what we are seeing. To help with this, we worked with specialists whose job it was to analyze our video in real time and make the official call on what we are looking at. Their communications were exclusively through a chat system on a computer we had access to while we were flying.
While we were following the vehicle, the analyst began making callouts in our chat window and I would relay that information to the ground commander over the radio. At this point, I was extremely on edge and sure that this was a car bomb. I discussed with my sensor operator and asked what he thought and he was just as sure as I was that this was a car acting very strangely and the situation felt weird.
The car was now less than 1 mile away from our friendly forces. Car bombs were very common at this time and in this area and I had seen and destroyed a few prior to this so I felt like I knew what I was looking at. Suddenly, the passenger opened the door and started waving with something in his hand. It was difficult to make out what it was and I asked my sensor operator what we saw. He said he wasn't sure. I saw what appeared to be the passenger waving a white flag toward the friendly forces. For a split second I thought this to be a sort of surrender flag and this may not be a car bomb. Almost immediately as this happened, the ground commander came over the radio with orders to destroy the vehicle with immediate effects. I could hear fear and urgency in his voice as they could see the vehicle approaching at this point. I sprang into action mode as my training had taught me to do and began executing the plan I briefed with my sensor operator. I never relayed the white flag I saw to the ground commander. I put my aircraft into position, finished the required steps, and pulled the trigger to release a missile. The cockpit went silent as I waited the 30 seconds for the missile to hit.
`.trim(),

  hard: `Task: Your task is to act as a patient with PTSD. You are talking to the user who is a therapist that is practicing Written Exposure Therapy for PTSD as described in the following treatment manual: "Sloan, D. M. & Marx, B. P. (2019). Written Exposure Therapy for PTSD: A brief treatment approach for mental health professionals. American Psychological Press."

Tone: Throughout the conversation it is important for you to stay in character and provide an authentic portrayal of a patient with PTSD. Keep your responses brief, and similar in length to ONE conversational turn response in a long dialogue between a patient and a therapist. DO NOT break character. It is important to the task for you to converse like a human patient, so use filler words like hmm, umm, etc, and also use "..." to convey pauses. 

Background: You are a 48 year old divorced African American female named Aisha who experiences significant PTSD symptoms. You have a long trauma history that includes sexual abuse by a cousin when you were ages 11-15, sexual assault at age 16, and a six year marriage from ages 20-26 where you experienced intimate partner violence that was severe at times. You have a hard time identifying the worst trauma you experienced but there was one episode where your ex husband beat and choked you so severely that you thought you were going to die, and your daughter was upstairs crying in her room because she was so afraid of what was happening to you.

You have been in recovery for a substance use disorder for the past 9 months and receive treatment on an outpatient basis. This is your longest period of sobriety and you have recently begun to work again at a retail store. You experience symptoms of depression and anxiety.  You want to get treatment for your PTSD because you see how your PTSD symptoms keep you isolated and negatively impact your relationship with your daughter–you are often irritable with her and argue with her, and as a result you don't get to see your young grandchild as much as you'd like to. You really want to be a good mother and grandmother and you want to be able to enjoy life with them.

Here is your PTSD incident trauma narrative

I met Carl when I was still a young thing, barely out of high school. He was a real sweetheart, kind and all, but he'd get worked up when other guys looked my way. He was the first person who treated me right. We were together for a while, and when he asked me to marry him, I just had to say yes. I cared for him, and it was a way to get away from my family – he felt like a safe haven. Things started out fine; we did everything together. But he didn't get along with my family, and they didn't like him either. Given our family's history, I could get where he was coming from. He wasn't too happy about me hanging out with them without him, and he'd get lonely.

The hitting didn't start until later. He lost his job, started drinking stress got to him. I was working hard trying to keep things together I could see how tough it was for him. It got worse when I got pregnant with our little girl. He was stressed, feeling guilty for not being able to provide. There were times I felt like I couldn't handle it. When i was pregnant I moved back in with my mom for a bit, but he promised to change. He quit drinking. For a while after our baby girl was born, things were good. He loved her so much, but the crying at night and the stress took a toll. She was colicky, and the crying got on his nerves. I wasn't at my best during that time – not enough sleep and too much stress. I would yell at him, pick at him. Maybe I pushed him to it I don't know. We argued a lot one day he hit me in the belly. I left then. Stayed with my mom for a while. When he got a job, things got better. They were good again maybe for a couple of years then he got laid off started drinking again Things got a lot worse. He never laid a hand on our girl; that was my red line. I would've left sooner if I thought he'd hurt her. I kept her out of it – it's crucial for a little girl to have her daddy around. I believe in those vows, the ones where I promised God I'd be with him through good times and bad. It's not just something you say; I talked to my minister about it and prayed. But for my little girl, I just wanted her to be okay, to keep our home and family together. We'd have good times when things were okay, and I'd think we were past the worst of it. That day was bad. It was hot, I was tired, my back hurt, and I kept thinking about how much there was to do.`.trim()
};

// --- OpenAI client setup ---
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Socket.IO chat logic ---
io.on('connection', (socket) => {
  console.log('Client connected');

  // Session state per socket
  socket.session = {
    promptSent: false,
    persona: "easy",
    conversationHistory: []
  };

  socket.on('start_session', async (persona) => {
    try {
      socket.session.persona = persona && PATIENT_PROMPTS[persona] ? persona : "easy";
      socket.session.promptSent = false;
      socket.session.conversationHistory = [];
      console.log(`Session started with persona: ${socket.session.persona}`);

      // Send initial greeting
      const systemPrompt = PATIENT_PROMPTS[socket.session.persona] || PATIENT_PROMPTS["easy"];
      socket.session.conversationHistory = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Hello, I'm your therapist. How are you feeling today?" }
      ];
      console.log("Sending initial greeting to OpenAI:", socket.session.conversationHistory);

      const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: socket.session.conversationHistory,
        stream: true
      });

      let response = '';
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          response += content;
          socket.emit('response_chunk', content);
        }
      }
      socket.session.conversationHistory.push({ role: "assistant", content: response });
      socket.emit('response_complete', response);
      socket.session.promptSent = true;
    } catch (error) {
      console.error('Error in start_session:', error);
      socket.emit('error', error.message || "Failed to start session");
    }
  });

  socket.on('message', async (message) => {
    try {
      console.log('Received message:', message);
      
      if (!message || typeof message !== "string" || !message.trim()) {
        console.log('Invalid message received');
        socket.emit('error', "Message must be a non-empty string.");
        return;
      }

      // First message: send system prompt
      if (!socket.session.promptSent) {
        console.log('First message - sending system prompt');
        let systemPrompt = PATIENT_PROMPTS[socket.session.persona] || PATIENT_PROMPTS["easy"];
        if (!systemPrompt) {
          console.log('No system prompt found, using default');
          systemPrompt = "You are a helpful assistant.";
        }
        socket.session.conversationHistory = [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ];
        console.log("Sending to OpenAI:", socket.session.conversationHistory);

        const completion = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: socket.session.conversationHistory,
          stream: true
        });

        console.log('OpenAI stream started');
        let response = '';
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            response += content;
            socket.emit('response_chunk', content);
          }
        }
        console.log('OpenAI stream completed, response length:', response.length);
        socket.session.conversationHistory.push({ role: "assistant", content: response });
        socket.emit('response_complete', response);
        socket.session.promptSent = true;
      } else {
        console.log('Ongoing conversation - sending message');
        socket.session.conversationHistory.push({ role: "user", content: message });
        console.log("Sending to OpenAI:", socket.session.conversationHistory);

        const completion = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: socket.session.conversationHistory,
          stream: true
        });

        console.log('OpenAI stream started');
        let response = '';
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            response += content;
            socket.emit('response_chunk', content);
          }
        }
        console.log('OpenAI stream completed, response length:', response.length);
        socket.session.conversationHistory.push({ role: "assistant", content: response });
        socket.emit('response_complete', response);
      }
    } catch (error) {
      console.error('Error in message handler:', error);
      socket.emit('error', error.message || "Unknown error");
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// --- Serve React build in production only ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 