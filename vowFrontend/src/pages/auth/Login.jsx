import { useState } from "react";
import useAuth from "../../hooks/UseAuth";

const Login = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      
    </div>
  );
};

export default Login;