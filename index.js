// Autor: Karteikay (Karty) Dhuper
// Date: May 5th 2022 @ 4:16am
// About: Javascript program that switches website to darkmode during nighttime amongst other things.

var today = new Date();
var bg = document.getElementById("dark-mode-bg");
var texts = document.getElementsByClassName("dark-mode-text"); // stored as an array since multiple classes with words are stored
var headers = document.getElementsByClassName("header");
var greeting = document.getElementsByClassName("title");
var nav = document.getElementById("dark-mode-nav");
var lp = document.getElementById("landingPage")


console.log("How's it going hackers.");
console.log("Today's date is: "+today);
  
// code for dark mode
	
var btn = document.getElementById("darkModeBtn").addEventListener("click", toggleDarkMode);
var pressed = null; // variable tracks how many times the dark mode button was pressed
console.log(pressed);

pressed += 1; 
toggleDarkMode();
// if-statement handles site-wide dark mode implementation only if its after 5:59pm or before 7 am 
// if (today.getHours() > 17 || today.getHours() < 7 ) 
// {
// 	 console.log("Shhh it's night time. Everyone is sleeping...")
// 	 console.log("~ Switching to nightmode ~")

// 	 try
// 	 {
// 		var headline = document.getElementById("toggle-notification");
// 		headline.innerText = "Light mode will automatically toggle at 7 am.";
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

function toggleDarkMode()
{
	 if(pressed == null) // adds 2 to the pressed counter when its day-time and the button hasn't been pressed so that the first time the button is pressed the value is an even 2 and not null or 0 
	 {
	 	pressed += 2;
	 }
	 else 
	 {
		pressed += 1
	 }

	console.log("Dark mode button pressed "+pressed+" times. (even = dark , odd = light)")


	if(pressed % 2 == 0) //dark mode is only toggled on when the value of the "pressed" variable is even
	{
		try
		{
			lp.classList.remove("landingAttribsLight")
			lp.classList.add("landingAttribsDark");
		}
		catch
		{
			console.log("Website landing page not on this page")
		}
		finally
		{
			bg.style.backgroundColor = "black"; // background color changed to black 
		}
		//Changing text to dark mode with white text
		for (let text of texts) // for-loop iterates through texts array and changes each text element's style to white
		{
			text.style.color = "white";
		}
		
		for (let header of headers)
		{
			header.style.color = "#1ce783" // changes header text to a lighter more bright green for contrast
		}

		for (let i of greeting)
		{
			i.style.color = "#1ce783"
		}

		//Changing Nav Bar to Dark Mode
		nav.classList.remove("navbar-light");
		nav.classList.remove("bg-light");
		nav.classList.add("navbar-dark")
		
		nav.style.backgroundColor = "rgba(0, 255, 255, 0)";
		
		document.getElementById("darkModeBtn").value = "  Toggle light mode  "
	}
	else // condiiton if "pressed" variable is odd and light mode is switched on.
	{
		try
		{
			lp.classList.add("landingAttribsLight");
		}
		catch
		{
			console.log("Website landing page not on this page.")
		}
		finally
		{
			bg.style.backgroundColor = "white";
		}
		//bg.style.background = null

		//Changing text to light mode with black text 
		for (let text of texts)
		{
			text.style.color = "black";
		}

		for (let header of headers)
		{
			header.style.color = "#03e976"
		}

		for (let i of greeting)
		{
			i.style.color = "#03e976"
		}

		//Changing Nav Bar to light mode
		nav.classList.remove("navbar-dark");
		nav.classList.add("navbar-light");
		nav.classList.add("bg-light");

		nav.style.backgroundColor = "rgba(0, 255, 255, 0)";

		document.getElementById("darkModeBtn").value = "  Toggle dark mode  "

	}

} 

// Code for scroll progress bar

const scrollProgressBar = document.getElementById("scroll-progress");

function scrollProgress()
{
	const webpageHeight = document.body.scrollHeight;
	const distanceFromTop = document.documentElement.scrollTop;
	const windowheight = document.documentElement.clientHeight;
	const percentageScrolled = (distanceFromTop / (webpageHeight - windowheight)) * 100;

	console.log(Math.round(percentageScrolled));

	scrollProgressBar.style.width = percentageScrolled + "%"

}
document.addEventListener('scroll', scrollProgress);


