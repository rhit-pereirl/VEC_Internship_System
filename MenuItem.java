

public abstract class MenuItem {
    private String name;
    private float cost;

    public MenuItem(String name, float cost) {
        this.name = name;
        this.cost = cost;
    }

    public float getPrice() {
        return this.cost;
    }

}
