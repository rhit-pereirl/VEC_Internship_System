import java.util.ArrayList;

public class Guest {
    
    private String name;
    private ArrayList<Order> orderHistory;

    public Guest(String name) {
        this.name = name;
    }

    public void addOrder(Order order) {
        orderHistory.add(order);
    }


}
