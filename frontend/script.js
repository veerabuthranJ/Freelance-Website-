const API_BASE = 'http://localhost:5002/api';
const views = document.querySelectorAll('.view');
const navButtons = document.querySelectorAll('nav button');

const showView = (viewId) => {
  views.forEach((view) => view.classList.toggle('active', view.id === viewId));
};

const setMessage = (selector, message, isError = true) => {
  const el = document.querySelector(selector);
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? '#dc2626' : '#15803d';
};

const getToken = () => sessionStorage.getItem('token');
const getRole = () => sessionStorage.getItem('role');

const normalizeUrl = (path) => path.replace(/\\/g, '/');

const logout = () => {
  sessionStorage.clear();
  showView('home');
};

const renderFreelancerDashboard = (profile) => {
  const profileContainer = document.getElementById('freelancer-profile');
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  profileContainer.innerHTML = `
    <h3>Profile</h3>
    <p><strong>Name:</strong> ${profile.name}</p>
    <p><strong>Email:</strong> ${profile.email}</p>
    <p><strong>Phone:</strong> ${profile.phone || 'N/A'}</p>
    <p><strong>Skills:</strong> ${skills.length ? skills.join(', ') : 'No skills provided'}</p>
    <p><strong>Experience:</strong> ${profile.experience ?? 'N/A'} years</p>
    <p class="small-note">Resume available after registration on the backend.</p>
  `;
};

const renderRecruiterDashboard = (profile) => {
  const profileContainer = document.getElementById('recruiter-profile');
  profileContainer.innerHTML = `
    <h3>Profile</h3>
    <p><strong>Name:</strong> ${profile.name}</p>
    <p><strong>Email:</strong> ${profile.email}</p>
    <p><strong>Company:</strong> ${profile.companyName}</p>
  `;
};

const fetchInvitations = async () => {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE}/freelancer/invitations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load invitations.');

    const list = document.getElementById('invitation-list');
    list.innerHTML = data.invitations.length
      ? data.invitations.map((invitation) => `
          <li>
            <h4>Invitation from ${invitation.recruiterId.name}</h4>
            <p><strong>Company:</strong> ${invitation.recruiterId.companyName}</p>
            <p><strong>Email:</strong> ${invitation.recruiterId.email}</p>
            <p><strong>Address:</strong> ${invitation.recruiterId.address}</p>
            <p><strong>Status:</strong> ${invitation.status}</p>
            <p><small>Sent: ${new Date(invitation.createdAt).toLocaleString()}</small></p>
          </li>
        `)
      : '<li>No invitations yet.</li>';
  } catch (error) {
    setMessage('#freelancer-login-message', error.message);
  }
};

const renderSearchResults = (freelancers) => {
  const results = document.getElementById('freelancer-results');
  if (!freelancers.length) {
    results.innerHTML = '<li>No freelancers found for that skill.</li>';
    return;
  }

  results.innerHTML = freelancers
    .map((freelancer) => {
      const resumeUrl = freelancer.resume ? `http://localhost:5001/${normalizeUrl(freelancer.resume)}` : '#';
      return `
        <li>
          <h4>${freelancer.name}</h4>
          <p><strong>Skills:</strong> ${Array.isArray(freelancer.skills) && freelancer.skills.length ? freelancer.skills.join(', ') : 'No skills provided'}</p>
          <p><strong>Experience:</strong> ${freelancer.experience ?? 'N/A'} years</p>
          <p><a href="${resumeUrl}" target="_blank">View Resume</a></p>
          <button class="invite-button" data-id="${freelancer._id}">Invite Freelancer</button>
        </li>
      `;
    })
    .join('');
};

const initNavigation = () => {
  navButtons.forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.view));
  });
};

const initAuthForms = () => {
  document.getElementById('freelancer-register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('#freelancer-register-message', '');
    const form = event.target;
    const formData = new FormData(form);

    try {
      const response = await fetch(`${API_BASE}/freelancer/register`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed.');
      setMessage('#freelancer-register-message', data.message, false);
      form.reset();
    } catch (error) {
      setMessage('#freelancer-register-message', error.message);
    }
  });

  document.getElementById('freelancer-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('#freelancer-login-message', '');
    const form = event.target;
    const body = {
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const response = await fetch(`${API_BASE}/freelancer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed.');

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', 'freelancer');
      sessionStorage.setItem('user', JSON.stringify(data.freelancer));
      renderFreelancerDashboard(data.freelancer);
      fetchInvitations();
      showView('freelancer-dashboard');
      form.reset();
    } catch (error) {
      setMessage('#freelancer-login-message', error.message);
    }
  });

  document.getElementById('recruiter-register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('#recruiter-register-message', '');
    const form = event.target;
    const body = {
      name: form.name.value,
      email: form.email.value,
      password: form.password.value,
      companyName: form.companyName.value,
      companyStartDate: form.companyStartDate.value,
      address: form.address.value,
    };

    try {
      const response = await fetch(`${API_BASE}/recruiter/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed.');
      setMessage('#recruiter-register-message', data.message, false);
      form.reset();
    } catch (error) {
      setMessage('#recruiter-register-message', error.message);
    }
  });

  document.getElementById('recruiter-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('#recruiter-login-message', '');
    const form = event.target;
    const body = {
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const response = await fetch(`${API_BASE}/recruiter/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed.');

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', 'recruiter');
      sessionStorage.setItem('user', JSON.stringify(data.recruiter));
      renderRecruiterDashboard(data.recruiter);
      showView('recruiter-dashboard');
      form.reset();
    } catch (error) {
      setMessage('#recruiter-login-message', error.message);
    }
  });
};

const initSearchAndInvite = () => {
  document.getElementById('search-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const skill = document.getElementById('search-skill').value.trim();
    setMessage('#search-message', '');
    if (!skill) {
      setMessage('#search-message', 'Please enter a skill to search.');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/recruiter/search?skill=${encodeURIComponent(skill)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Search failed.');
      renderSearchResults(data.freelancers);
    } catch (error) {
      setMessage('#search-message', error.message);
    }
  });

  document.getElementById('freelancer-results').addEventListener('click', async (event) => {
    if (!event.target.classList.contains('invite-button')) return;
    const freelancerId = event.target.dataset.id;
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/recruiter/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ freelancerId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invitation failed.');
      setMessage('#search-message', data.message, false);
    } catch (error) {
      setMessage('#search-message', error.message);
    }
  });
};

const initLogoutButtons = () => {
  document.getElementById('logout-button').addEventListener('click', logout);
  document.getElementById('logout-button-2').addEventListener('click', logout);
};

const restoreSession = () => {
  const role = getRole();
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  if (!role || !user) return;

  if (role === 'freelancer') {
    renderFreelancerDashboard(user);
    fetchInvitations();
    showView('freelancer-dashboard');
  }
  if (role === 'recruiter') {
    renderRecruiterDashboard(user);
    showView('recruiter-dashboard');
  }
};

const init = () => {
  initNavigation();
  initAuthForms();
  initSearchAndInvite();
  initLogoutButtons();
  restoreSession();
};

init();
