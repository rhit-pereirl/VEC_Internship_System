import java.util.ArrayList;

public class Order {
    
    private ArrayList<MenuItem> orderedItems;

    private float calcPrice() {
        float total = 0;
        for (MenuItem item: orderedItems) {
            total += item.getPrice();
        }
        return total;
    }

    public float getTotal() {
        return calcPrice();
    }

    

}
