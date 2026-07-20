

public abstract class MenuItem {
    private String name;
    private float cost;

    public MenuItem(String name, float cost) {
        this.name = name;
        this.cost = cost;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCost(float price) {
        this.cost = price;
    }

    public float getPrice() {
        return this.cost;
    }

    public String getName() {
        return this.name;
    }

}
