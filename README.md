![image](https://github.com/PatrickFrankAIU/GradeManagerProject/assets/134087916/b5d814bf-e38f-456f-8f9c-cb5a98fb52fa)

# ITWEB300-2502B
Student repository for exercises and testing for ITWEB300-2502B.    
Patrick Frank, Instructor

The front end of this project is hosted on Pages. You can pull it up by following the link below: 



# Construction Notes
This project was created in Visual Studio Code and uses Node, Express, HTML, CSS and JS. The code was with the assistance of Copilot using Claude Sonnet 3.7. This was used mainly for the CSS, code comments, and most of the logic in server.js, as well as some improvements to the JavaScript code in main.js. 

# Context Info
I'm experimenting with context files for AI agents with GitHub Copilot. The notes below are related to that. 

# Classroom Demonstrations — Frontend JavaScript Only

## Purpose
Projects in this repository are designed to be simple, readable, and beginner-friendly.

## Language and Technology Constraints
- **Languages**: JavaScript, HTML, and CSS
- **NO frameworks or libraries** allowed, including:
  - React
  - jQuery
  - Vue.js
  - Angular
  - Any external JavaScript libraries

## Code Style Guidelines
When writing or suggesting code for this repository:

- **Always** use `if/else` logic.  
  - **Avoid** ternary (`condition ? true : false`) expressions.
- **Always** declare variables with `let` unless `const` is clearly required.  
  - **Avoid** using `var`.
- **Use old-style string concatenation** with `+` operator.  
  - **Avoid** using template literals (backticks `` ` ``).
    - Example: `"Hello, " + name + "!"` instead of `` `Hello, ${name}!` ``

## File Organization
- Each project or demo should have its own folder.
- Each project folder should include:
  - An `index.html`
  - A `main.css` (even if minimal)
  - A `main.js`

## Additional Notes
- Code should prioritize **clarity** and **readability** over efficiency or conciseness.
- Comments are encouraged, especially to explain steps in JavaScript files.
- Each function should have a **short comment** explaining its purpose.
- **When writing callbacks**, prefer using **arrow functions** instead of anonymous `function()` syntax.
- **Avoid** using `switch` statements. Use `if/else` logic consistently.
- Assume `main.css` and `main.js` at all times when writing HTML. 
