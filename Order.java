import java.math.BigDecimal;
import java.util.ArrayList;

public class Order {
    
    private ArrayList<MenuItem> orderedItems;

    private BigDecimal calcPrice() {
        BigDecimal total = BigDecimal.ZERO;
        for (MenuItem item: orderedItems) {
            total.add(item.getPrice());
        }
        return total;
    }

    public BigDecimal getTotal() {
        return calcPrice();
    }

    

}
