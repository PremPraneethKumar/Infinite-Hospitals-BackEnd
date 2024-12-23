// app.js
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;
mongoose.connect('mongodb://127.0.0.1:27017/MST', { useNewUrlParser: true, 
useUnifiedTopology: true });

 // Create a Mongoose model (schema)
 const Datas = mongoose.model('Datas', {
    firstname: String,
    lastname: String,
    gender: String,
    number: Number,
    email: String,
    password: String
 });
 // Create a Mongoose model (schema)
 const Appointment = mongoose.model('Appointment', {
  name: String,
  department: String,
  email: String,
  number: Number,
  gender: String,
  date: String
});
 // Middleware for parsing form data
 app.use(bodyParser.urlencoded({ extended: true }));

 app.use(express.static(path.join(__dirname, 'public')));
 
 // Serve the Sign-up form
 app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'/public/home.html'));
 });
 // Handle form submission
 app.post('/Sign-up', (req, res) => {
  const { firstname, lastname, gender, number, email, password } = req.body;
  
  // Create a new User document and save it to MongoDB
  const user = new Datas({ firstname, lastname, gender, number, email, password });
     user.save()
     .then(() => {
         
         const errorMessage = 'Registration Done Successfully!';
         return res.status(400).send(`
         <script>
             alert("${errorMessage}");
             window.location.href = "/HOME.html";
         </script>
         `);
  })
 
  .catch((err) => {
  console.error(err);
     res.status(500).send('Error saving data to MongoDB.');
  });
  });

  app.post('/submit', (req, res) => {
    const { name, department, email, number, gender, date } = req.body;
    
    // Create a new User document and save it to MongoDB
    const user = new Appointment({ name, department, email, number, gender, date });
       user.save()
       .then(() => {
           
           const errorMessage = 'Appointment Booked Successfully!';
           return res.status(400).send(`
           <script>
               alert("${errorMessage}");
               window.location.href = "/HOME.html";
           </script>
           `);
    })
   
    .catch((err) => {
    console.error(err);
       res.status(500).send('Error saving data to MongoDB.');
    });
    });
  // Serve the login form

// Serve the login form
app.post('/SignIn', (req, res) => {
  const { email, password } = req.body; // Use req.body to get data from the POST request

  // Check if the entered details exist in the database
  Datas.findOne({ email, password }).exec()
    .then(data => {
      if (data) {
        const errorMessage = 'Login Successfully! Continue your Appointment';
        res.status(200).send(`
          <script>
            alert("${errorMessage}");
            window.location.href = "/HOME.html";
          </script>
        `);
      } else {
        const errorMessage = 'INVALID LOGIN CREDENTIALS';
        res.status(400).send(`
          <script>
            alert("${errorMessage}");
            window.location.href = "/login.html";
          </script>
        `);
      }
    })
    .catch(err => {
      console.error(err);
      const errorMessage = 'An error occurred while checking login details';
      res.status(500).send(`
        <script>
          alert("${errorMessage}");
          window.location.href = "/login.html";
        </script>
      `);
    });
});
// updating value via browser
app.post('/forgot', (req, res) => {
  try {
    const { email, newpassword } = req.body;
    console.log(email,newpassword);
    // Find the user by username and update their email
    Datas.findOneAndUpdate(
      { email },
      { password: newpassword },
      { new: true }
    )
    .then(updatedUser => {
      if (updatedUser) {
        const errorMessage="Updated Succesfully !";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/login.html";
        </script>`);
      } else {
        const errorMessage="INVALID DETAILS !";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/login.html";
        </script>`);
      }
    }).catch(err => {
      console.error(err);
      const errorMessage="An error occurred while updating user data.";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/login.html";
        </script>`);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while updating user data.');
  }
});
//Delete account
app.post('/Delete', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Datas.findOneAndDelete({ email, password });

    if (!user) {
      const errorMessage = 'User not found';
      return res.status(400).send(`
        <script>
          alert("${errorMessage}");
          window.location.href = "/"; // Redirect to the same page
        </script>
      `);
    }

    const successMessage = 'Account deleted successfully!';
    return res.status(200).send(`
      <script>
        alert("${successMessage}");
        window.location.href = "/home.html"; // Redirect to the same page
      </script>
    `);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//view all
app.get('/view', (req, res) => {
  // Fetch all booking records from the MongoDB database
  Appointment.find({})
    .then(data => {
      // Create an HTML table
      let tableHtml = `
      <title>APPOINTMENT DETAILS ~ INFINITE HOSPITAL</title>
      <h2 align="center">APPOINTMENT DETAILS</h2>
        <table border="1" align="center">
          <thead>
            <tr align="center">
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Gender</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Loop through the data and add rows to the table
      data.forEach(Appointment => {
        tableHtml += `
          <tr align="center">
            <td>${Appointment.name}</td>
            <td>${Appointment.department}</td>
            <td>${Appointment.email}</td>
            <td>${Appointment.number}</td>
            <td>${Appointment.gender}</td>
            <td>${Appointment.date}</td>
          </tr>
        `;
      });

      // Close the table HTML
      tableHtml += `
          </tbody>
        </table>
      `;

      // Send the HTML as a response
      res.send(tableHtml);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error retrieving data from MongoDB.');
    });
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});