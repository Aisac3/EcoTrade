package com.example.ecotrade.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    /**
     * Handles requests to the root path and other frontend routes.
     * This is needed to support client-side routing in the React application.
     * 
     * @return the name of the index page
     */
    @GetMapping(value = {"", "/", "/marketplace", "/waste-collection", "/plant-growth", "/community", "/profile", "/cart"})
    public String index() {
        return "forward:/index.html";
    }
} 