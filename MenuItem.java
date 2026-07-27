import java.math.BigDecimal;

public abstract class MenuItem {
    private String name;
    private BigDecimal cost;

    public MenuItem(String name, BigDecimal cost) {
        this.name = name;
        this.cost = cost;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCost(BigDecimal price) {
        this.cost = price;
    }

    public BigDecimal getPrice() {
        return this.cost;
    }

    public String getName() {
        return this.name;
    }

}
