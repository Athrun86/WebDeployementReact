import {useState} from "react";

import LoginForm from "./Components/LoginForm.tsx";
import ProjectListPage from "./Components/ProjectListPage.tsx";
import ProjectForm from "./Components/ProjectForm.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import StudentAdd from "./Components/StudentAdd.tsx"

function App()
{
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    function handleLogin(username: string, password: string) {
        if (username === "admin" && password === "password")
        {
            alert("Login successful!");
            setIsAuthenticated(true);
        } else {
                alert("Username and password is incorrect.");
                }
        }

    if (!isAuthenticated)
    {
        return <LoginForm onLogin={handleLogin} />;
    }
    return (
    <BrowserRouter>
        <Routes>
            <Route path="/"  element={<ProjectListPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/CreateProject" element={<ProjectForm />} />
            <Route path={"/AddStudent"} element={<StudentAdd />} />

        </Routes>
    </BrowserRouter>
    );
}

export default App;