import java.math.BigDecimal;

public class Experience {
    private String name;
    private BigDecimal cost;

    public Experience(String name, BigDecimal cost) {
        this.name = name;
        this.cost = cost;
    }

    public String getName() {
        return this.name;
    }

    public BigDecimal getPrice() {
        return this.cost;
    }
}

