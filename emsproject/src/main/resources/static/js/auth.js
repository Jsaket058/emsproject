   // DOM Elements
   const loginBtn = document.getElementById('login-btn');
   const registerBtn = document.getElementById('register-btn');
   const logoutBtn = document.getElementById('logout-btn');
   const loginModal = document.getElementById('login-modal');
   const registerModal = document.getElementById('register-modal');

   // Initialize
   document.addEventListener('DOMContentLoaded', () => {
       // Render forms
       renderLoginForm();
       renderRegisterForm();

       // Event listeners
       loginBtn.addEventListener('click', () => app.openModal('login-modal'));
       registerBtn.addEventListener('click', () => app.openModal('register-modal'));
       logoutBtn.addEventListener('click', handleLogout);
   });

   // Render Forms
   function renderLoginForm() {
       loginModal.innerHTML = `
           <div class="modal-content animate-pop">
               <div class="modal-header">
                   <h3 class="modal-title">Login</h3>
                   <button class="close-btn">&times;</button>
               </div>
               <form id="login-form">
                   <div class="form-group">
                       <label for="login-email" class="form-label">Email</label>
                       <input type="email" id="login-email" class="form-control" required>
                   </div>
                   <div class="form-group">
                       <label for="login-password" class="form-label">Password</label>
                       <input type="password" id="login-password" class="form-control" required>
                   </div>
                   <button type="submit" class="btn btn-primary btn-block">Login</button>
               </form>
           </div>
       `;

       // Add form submit handler
       document.getElementById('login-form').addEventListener('submit', handleLogin);

       // Close button
       loginModal.querySelector('.close-btn').addEventListener('click', () => {
           app.closeModal('login-modal');
       });
   }

   function renderRegisterForm() {
       registerModal.innerHTML = `
           <div class="modal-content animate-pop">
               <div class="modal-header">
                   <h3 class="modal-title">Register</h3>
                   <button class="close-btn">&times;</button>
               </div>
               <form id="register-form">
                   <div class="form-group">
                       <label for="register-email" class="form-label">Email</label>
                       <input type="email" id="register-email" class="form-control" required>
                   </div>
                   <div class="form-group">
                       <label for="register-password" class="form-label">Password</label>
                       <input type="password" id="register-password" class="form-control" required>
                   </div>
                   <div class="form-group">
                       <label for="register-role" class="form-label">Role</label>
                       <select id="register-role" class="form-control" required>
                           <option value="">Select Role</option>
                           <option value="ORGANIZER">Event Organizer</option>
                           <option value="ATTENDEE">Event Attendee</option>
                       </select>
                   </div>
                   <button type="submit" class="btn btn-primary btn-block">Register</button>
               </form>
           </div>
       `;

       // Add form submit handler
       document.getElementById('register-form').addEventListener('submit', handleRegister);

       // Close button
       registerModal.querySelector('.close-btn').addEventListener('click', () => {
           app.closeModal('register-modal');
       });
   }

   // Handlers
   async function handleLogin(e) {
       e.preventDefault();
       app.showLoading();

       const email = document.getElementById('login-email').value;
       const password = document.getElementById('login-password').value;

       try {
           const response = await fetch(`${API_BASE_URL}/auth/login`, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ email, password })
           });

           if (!response.ok) {
               throw new Error('Login failed');
           }

           const data = await response.json();
           localStorage.setItem('token', data.token);
           app.closeModal('login-modal');
           app.checkAuthState();

           // Show success message
           alert('Login successful!');
       } catch (error) {
           alert('Login failed. Please check your credentials.');
           console.error(error);
       } finally {
           app.hideLoading();
       }
   }

   async function handleRegister(e) {
       e.preventDefault();
       app.showLoading();

       const email = document.getElementById('register-email').value;
       const password = document.getElementById('register-password').value;
       const role = document.getElementById('register-role').value;

       try {
           const response = await fetch(`${API_BASE_URL}/auth/signup`, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ email, password, role })
           });

           if (!response.ok) {
               throw new Error('Registration failed');
           }

           const data = await response.json();
           localStorage.setItem('token', data.token);
           app.closeModal('register-modal');
           app.checkAuthState();

           // Show success message
           alert('Registration successful! You are now logged in.');
       } catch (error) {
           alert('Registration failed. Please try again.');
           console.error(error);
       } finally {
           app.hideLoading();
       }
   }

   function handleLogout() {
       localStorage.removeItem('token');
       app.checkAuthState();
       app.showSection('home');
       alert('You have been logged out.');
   }