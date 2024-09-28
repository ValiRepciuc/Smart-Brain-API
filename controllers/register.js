const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;

  // Check if any fields are missing
  if (!email || !name || !password) {
    return res.status(400).json("Incorrect form submission");
  }

  const hash = bcrypt.hashSync(password); // Hash the password

  // Use transaction to ensure both the login and user insertions succeed or fail together
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        // Ensure that loginEmail[0] is just the email string
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0].email, // Directly use the email string
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]); // Return the first user object
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("Unable to register"));
};

module.exports = {
  handleRegister: handleRegister,
};
