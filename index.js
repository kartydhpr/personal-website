// Autor: Karteikay (Karty) Dhuper
// Date: May 5th 2022 @ 4:16am
// About: Javascript program that switches website to darkmode during nighttime amongst other things.

// ============================================
// COLOR CONFIGURATION - Easy to experiment with!
// ============================================
const COLOR_CONFIG = {
  // Dark Mode Colors
  darkMode: {
    background: "black",
    text: "white",
    header: "#1ce783",        // Bright green for headers
    cardBackground: "#3C4042" // Dark gray for cards
  },
  // Light Mode Colors
  lightMode: {
    background: "white",
    text: "black",
    header: "#03e976",        // Green for headers
    cardBackground: "#ffff"   // White for cards
  },
  // Shared Colors
  navBackground: "rgba(0, 255, 255, 0)", // Transparent cyan
  scrollProgress: "#ff6630"                // Orange for scroll bar
};

var today = new Date();
var bg = document.getElementById("dark-mode-bg");
var texts = document.getElementsByClassName("dark-mode-text"); // stored as an array since multiple classes with words are stored
var headers = document.getElementsByClassName("header");
var greeting = document.getElementsByClassName("title");
var nav = document.getElementById("dark-mode-nav");
var lp = document.getElementById("landingPage");
var cardElements = document.getElementsByClassName("card");

console.log("How's it going hackers.");
console.log("Today's date is: " + today);

// code for dark mode

var btn = document
  .getElementById("darkModeBtn")
  .addEventListener("click", toggleDarkMode);
var pressed = null; // variable tracks how many times the dark mode button was pressed
console.log(pressed);

// uncomment both lines when time based switching is inactive and you want dark mode as default
pressed += 1; 
toggleDarkMode();

// // if-statement handles site-wide dark mode implementation only if its after 5:59pm or before 7 am
// if (today.getHours() > 17 || today.getHours() < 7 )
// {
// 	 console.log("Shhh it's night time. Everyone is sleeping...")
// 	 console.log("~ Switching to nightmode ~")

// 	 try
// 	 {
// 		document.getElementById("toggle-notification").textContent = "It's night time, dark mode is active.";
// 	 }
// 	 catch(e)
// 	 {
// 		console.log("No headline on this page to update")
// 	 }
// 	 finally
// 	 {
// 		pressed += 1 // adds 1 to pressed counter so when toggleDarkMode() is executed variable is even.
// 		toggleDarkMode();
// 	 }
// }

function toggleDarkMode() {
  if (pressed == null) {
    // adds 2 to the pressed counter when its day-time and the button hasn't been pressed so that the first time the button is pressed the value is an even 2 and not null or 0
    pressed += 2;
  } else {
    pressed += 1;
  }

  console.log(
    "Dark mode button pressed " +
      pressed +
      " times. (even = dark , odd = light)"
  );

  if (pressed % 2 == 0) {
    //dark mode is only toggled on when the value of the "pressed" variable is even
    const colors = COLOR_CONFIG.darkMode;
    
    try {
      lp.classList.add("bg-dark");
    } catch {
      console.log("Website landing page not on this page");
    } finally {
      bg.style.backgroundColor = colors.background;
    }
    //Changing text to dark mode with white text
    for (let text of texts) { // for-loop iterates through texts array and changes each text element's style to white
      text.style.color = colors.text;
    }

    for (let header of headers) {
      header.style.color = colors.header;
    }

    for (let i of greeting) {
      i.style.color = colors.header;
    }

    //Changing Nav Bar to Dark Mode
    nav.classList.remove("navbar-light");
    nav.classList.remove("bg-light");
    nav.classList.add("navbar-dark");

    nav.style.backgroundColor = COLOR_CONFIG.navBackground;

    // Update icon to moon (dark mode is active)
    const darkModeIcon = document.getElementById("darkModeIcon");
    const darkModeText = document.getElementById("darkModeText");
    if (darkModeIcon) {
      darkModeIcon.classList.remove("fa-sun");
      darkModeIcon.classList.add("fa-moon");
    }
    if (darkModeText) {
      darkModeText.textContent = "Dark Mode";
    }
    document.getElementById("darkModeBtn").setAttribute("aria-label", "Switch to light mode");
    
    // Changing background color of card elements
    for (let card of cardElements) {
      card.style.background = colors.cardBackground;
    }

    // Changing music player container background in dark mode
    const musicPlayerContainer = document.getElementById('musicPlayerContainer');
    if (musicPlayerContainer) {
      musicPlayerContainer.style.background = colors.cardBackground;
    }
  } // condiiton if "pressed" variable is odd and light mode is switched on.
  else {
    const colors = COLOR_CONFIG.lightMode;
    
    try {
      lp.classList.remove("bg-dark");
    } catch {
      console.log("Website landing page not on this page.");
    } finally {
      bg.style.backgroundColor = colors.background;
    }
    //bg.style.background = null

    //Changing text to light mode with black text
    for (let text of texts) {
      text.style.color = colors.text;
    }

    for (let header of headers) {
      header.style.color = colors.header;
    }

    for (let i of greeting) {
      i.style.color = colors.header;
    }

    //Changing Nav Bar to light mode
    nav.classList.remove("navbar-dark");
    nav.classList.add("navbar-light");
    nav.classList.add("bg-light");

    nav.style.backgroundColor = COLOR_CONFIG.navBackground;

    // Update icon to sun (light mode is active)
    const darkModeIcon = document.getElementById("darkModeIcon");
    const darkModeText = document.getElementById("darkModeText");
    if (darkModeIcon) {
      darkModeIcon.classList.remove("fa-moon");
      darkModeIcon.classList.add("fa-sun");
    }
    if (darkModeText) {
      darkModeText.textContent = "Light Mode";
    }
    document.getElementById("darkModeBtn").setAttribute("aria-label", "Switch to dark mode");
    for (let card of cardElements) {
      card.style.background = colors.cardBackground;
    }

    // Reset music player container background in light mode
    const musicPlayerContainer = document.getElementById('musicPlayerContainer');
    if (musicPlayerContainer) {
      musicPlayerContainer.style.background = '';
    }
  }
}

// Code for scroll progress bar
const scrollProgressBar = document.getElementById("scroll-progress");

function scrollProgress() {
  const webpageHeight = document.body.scrollHeight;
  const distanceFromTop = document.documentElement.scrollTop;
  const windowheight = document.documentElement.clientHeight;
  const percentageScrolled =
    (distanceFromTop / (webpageHeight - windowheight)) * 100;

  console.log(Math.round(percentageScrolled));

  scrollProgressBar.style.width = percentageScrolled + "%";
}
document.addEventListener("scroll", scrollProgress);

// for fading in landing page hero
// Add the 'show' class to the image after the page loads
window.addEventListener('load', function() {
  const elements = document.querySelectorAll('.fade-in');
  elements.forEach(element => {
    element.classList.add('show');
  });
});

// for fading in each detail section on home page:
// Function to handle intersection changes
function handleIntersection(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target); // Stop observing once the effect is triggered
    }
  });
}
// Create an observer instance with a callback
const observer = new IntersectionObserver(handleIntersection, { threshold: 0.2 });
// Get all elements with the .details class and start observing them
const sections = document.querySelectorAll('.details');
sections.forEach(section => {
  observer.observe(section);
});

// Add the 'show' class to elements with the 'slide-in' class after the page loads
window.addEventListener('load', function() {
  const elements = document.querySelectorAll('.slide-up');
  elements.forEach(element => {
    element.classList.add('show');
  });
});

window.addEventListener('load', function() {
  const elements = document.querySelectorAll('.slide-in');
  elements.forEach(element => {
    element.classList.add('show');
  });
});

// Multi-language typing animation
const typewriterElement = document.getElementById('typewriter-text');
if (typewriterElement) {
  const languages = [
    { text: "Hey, I'm Karty", lang: "English" },
    { text: "你好，我是卡力亚", lang: "Mandarin Chinese" },
    { text: "नमस्ते , मैं कार्तिकेय हूँ", lang: "Hindi" },
    { text: "Salut, je suis Karty", lang: "French" }
  ];

  let currentLanguageIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  let baseTypingSpeed = 80; // base milliseconds per character (balanced)
  let baseDeletingSpeed = 40; // base milliseconds per character when deleting (balanced)
  let pauseAfterComplete = 2000; // pause after completing a phrase
  let pauseAfterDelete = 400; // pause after deleting before starting next language (balanced)

  function getRandomDelay(baseSpeed) {
    // Add slight randomness (±20%) to make typing feel more natural
    const variation = baseSpeed * 0.2;
    return baseSpeed + (Math.random() * variation * 2 - variation);
  }

  function typeText() {
    const currentLanguage = languages[currentLanguageIndex];
    const currentText = currentLanguage.text;

    if (!isDeleting && currentCharIndex < currentText.length) {
      // Typing forward
      typewriterElement.textContent = currentText.substring(0, currentCharIndex + 1);
      currentCharIndex++;
      // Use variable speed for more natural feel
      const delay = getRandomDelay(baseTypingSpeed);
      setTimeout(typeText, delay);
    } else if (!isDeleting && currentCharIndex === currentText.length) {
      // Finished typing, pause then start deleting
      isDeleting = true;
      setTimeout(typeText, pauseAfterComplete);
    } else if (isDeleting && currentCharIndex > 0) {
      // Deleting
      currentCharIndex--;
      typewriterElement.textContent = currentText.substring(0, currentCharIndex);
      // Use variable speed for smoother deletion
      const delay = getRandomDelay(baseDeletingSpeed);
      setTimeout(typeText, delay);
    } else if (isDeleting && currentCharIndex === 0) {
      // Finished deleting, move to next language
      isDeleting = false;
      currentLanguageIndex = (currentLanguageIndex + 1) % languages.length;
      setTimeout(typeText, pauseAfterDelete);
    }
  }

  // Start the typing animation
  typeText();
}

