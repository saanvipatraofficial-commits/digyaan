// The 8 Digyaan lessons. Edit the text here to change what students see.
// Each quiz question: q = question, options = choices, answer = index of the right choice (0 = first).
// Volunteers can add translations later with a "te", "hi" or "ur" copy of any lesson's fields.

window.LESSONS = [
  {
    id: 1,
    icon: "🛡️",
    title: "Being safe and kind online",
    summary:
      "The internet is like a huge city. It has libraries and playgrounds, but also strangers and tricks. Digital ethics means using it safely, honestly and kindly.",
    points: [
      "Never share your password, OTP, address or phone number with anyone online.",
      "A stranger online can pretend to be anyone. If someone asks to meet or wants secrets, tell a trusted adult.",
      "Messages saying 'You won a prize! Click here' are usually scams.",
      "Treat people online the way you want to be treated. Don't share hurtful photos or messages.",
    ],
    activity:
      "With a partner, make a list of 5 'online safety rules' for your class. Draw a poster for the lab wall.",
    quiz: [
      {
        q: "You get a message: 'Send your OTP to win a free phone.' What do you do?",
        options: ["Send the OTP quickly", "Ignore it and tell an adult", "Forward it to friends"],
        answer: 1,
      },
      {
        q: "Which of these is safe to share online?",
        options: ["Your home address", "Your password", "A drawing you made"],
        answer: 2,
      },
    ],
  },
  {
    id: 2,
    icon: "🤖",
    title: "What is AI?",
    summary:
      "Artificial Intelligence (AI) means computers doing tasks that usually need human thinking, like understanding speech, recognising faces or suggesting videos.",
    points: [
      "You already use AI: phone face unlock, YouTube suggestions, Google Translate.",
      "AI is not magic and not alive. It finds patterns in lots of examples.",
      "AI can make mistakes, so always check important answers.",
      "People decide what AI is used for, so we must use it fairly.",
    ],
    activity:
      "List 5 things at home or school that might use AI. For each one, write what job the AI does.",
    quiz: [
      {
        q: "Which one uses AI?",
        options: ["A ceiling fan", "Google Translate", "A pencil"],
        answer: 1,
      },
      {
        q: "How does AI learn?",
        options: ["By finding patterns in many examples", "By sleeping", "It already knows everything"],
        answer: 0,
      },
    ],
  },
  {
    id: 3,
    icon: "🧠",
    title: "How machines learn",
    summary:
      "Machine Learning (ML) is how AI learns. We show the computer many labelled examples, and it learns to guess the label for new things.",
    points: [
      "Training data = the examples we give, like 100 photos of mangoes and 100 of bananas.",
      "Labels = the right answers attached to each example ('mango', 'banana').",
      "Model = what the computer builds after learning. It makes guesses on new photos.",
      "More and better examples usually make a better model. Biased examples make a biased model.",
    ],
    activity:
      "Sort 10 classmates' drawings into 'cat' and 'dog' piles. You just did what an ML model does!",
    quiz: [
      {
        q: "What is 'training data'?",
        options: ["The examples a model learns from", "A train timetable", "The computer's password"],
        answer: 0,
      },
      {
        q: "A model only saw photos of red apples. What might go wrong?",
        options: ["Nothing", "It may not recognise green apples", "It will start talking"],
        answer: 1,
      },
    ],
  },
  {
    id: 4,
    icon: "🐱",
    title: "Scratch: your first program",
    summary:
      "Scratch lets you code by snapping blocks together like a puzzle. Each character is a sprite, and blocks tell sprites what to do.",
    points: [
      "Start every script with an Events block: 'when green flag clicked'.",
      "Motion blocks (blue) move sprites: 'move 10 steps', 'turn 15 degrees'.",
      "Looks blocks (purple) make sprites talk or change costume: 'say Hello! for 2 seconds'.",
      "Control blocks (orange) repeat things: 'forever' and 'repeat 10'.",
    ],
    activity:
      "Make the cat walk across the screen and say 'Namaste!' when it reaches the edge.",
    quiz: [
      {
        q: "Which block usually starts a Scratch program?",
        options: ["move 10 steps", "when green flag clicked", "forever"],
        answer: 1,
      },
      {
        q: "Which category has 'repeat 10'?",
        options: ["Control", "Looks", "Sound"],
        answer: 0,
      },
    ],
  },
  {
    id: 5,
    icon: "🎮",
    title: "Scratch: games and stories",
    summary:
      "Games need rules, and stories need scenes. Using 'if' blocks and variables, your sprites can react, score points and tell a story.",
    points: [
      "'if … then' (Control) checks a condition, like 'if touching Apple then'.",
      "Sensing blocks (light blue) detect touching, keys pressed and the mouse.",
      "A variable (like 'score') stores a number that changes during the game.",
      "Use backdrops and 'broadcast' messages to move a story from scene to scene.",
    ],
    activity:
      "Build a catch game: a basket moves with arrow keys, mangoes fall, and the score goes up by 1 for each catch.",
    quiz: [
      {
        q: "What is a variable used for?",
        options: ["Storing a changing value like score", "Changing the sprite's colour", "Deleting the project"],
        answer: 0,
      },
      {
        q: "Which block checks if a sprite is touching something?",
        options: ["A Sensing block inside 'if … then'", "say Hello!", "play sound"],
        answer: 0,
      },
    ],
  },
  {
    id: 6,
    icon: "🧩",
    title: "PictoBlox basics",
    summary:
      "PictoBlox looks like Scratch but adds AI and robotics. You can code sprites, and also control boards like Quarky.",
    points: [
      "Block coding works just like Scratch: Events, Motion, Looks, Control.",
      "Extensions add new powers: face detection, text to speech, speech recognition.",
      "Quarky is a small robot board with lights, buttons and sensors you can program.",
      "Always connect the board before running hardware blocks.",
    ],
    activity:
      "Add the Text to Speech extension. Make your sprite greet you out loud in Telugu or English.",
    quiz: [
      {
        q: "What do extensions in PictoBlox do?",
        options: ["Add new abilities like face detection", "Make the screen bigger", "Delete blocks"],
        answer: 0,
      },
      {
        q: "What is Quarky?",
        options: ["A programmable robot board", "A Scratch sprite", "A video game"],
        answer: 0,
      },
    ],
  },
  {
    id: 7,
    icon: "📷",
    title: "Training an ML model in PictoBlox",
    summary:
      "In PictoBlox's Machine Learning environment, you can train your own model, for example to tell a 'thumbs up' from a 'thumbs down' using the webcam.",
    points: [
      "Make one class for each thing to recognise (Thumbs up, Thumbs down).",
      "Add many sample images to each class, from different angles and lighting.",
      "Train the model, then test it with new images it has never seen.",
      "Export the model to blocks so a sprite can react to what it sees.",
    ],
    activity:
      "Train a model to recognise 3 school objects (pen, book, bottle). Make the sprite say the object's name.",
    quiz: [
      {
        q: "Why add many images from different angles?",
        options: ["So the model learns better", "To fill the hard disk", "It doesn't matter"],
        answer: 0,
      },
      {
        q: "How do you check if your model works?",
        options: ["Test it on new images", "Look at the code colour", "Restart the computer"],
        answer: 0,
      },
    ],
  },
  {
    id: 8,
    icon: "🏆",
    title: "Plan your showcase project",
    summary:
      "Now build something that solves a real problem around you, for the Digital Innovation Competition. Judges look for a clear idea, working code and a good explanation.",
    points: [
      "Pick a problem you care about: learning English, saving water, road safety, helping a grandparent.",
      "Choose your tool: a Scratch game or story, a PictoBlox ML model, or an AI mini app.",
      "Plan in 3 steps: what it does, what blocks you need, how you'll test it.",
      "Practise a 2-minute explanation: the problem, your solution, what you'd improve.",
    ],
    activity:
      "Write your project plan on one page: problem, idea, tool, team roles, and a sketch of the screen.",
    quiz: [
      {
        q: "What is the best showcase idea?",
        options: ["One that solves a real problem", "The one with the most colours", "Copying a friend's"],
        answer: 0,
      },
      {
        q: "What should your presentation include?",
        options: ["Problem, solution and improvements", "Only your name", "Nothing, the code speaks"],
        answer: 0,
      },
    ],
  },
];
