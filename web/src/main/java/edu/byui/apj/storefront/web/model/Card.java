package edu.byui.apj.storefront.web.model;

public class Card {
    private String name;
    private String specialty;

    public Card(String name, String specialty) {
        this.name = name;
        this.specialty = specialty;
    }

    public String getName() {
        return this.name;
    }

    public String getSpecialty() {
        return this.specialty;
    }
}
