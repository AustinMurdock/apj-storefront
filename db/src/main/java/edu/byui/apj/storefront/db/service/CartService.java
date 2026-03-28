package edu.byui.apj.storefront.db.service;

import edu.byui.apj.storefront.db.model.Cart;
import edu.byui.apj.storefront.db.model.Item;
import edu.byui.apj.storefront.db.repository.CartRepository;
import edu.byui.apj.storefront.db.repository.ItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final ItemRepository itemRepository;

    public CartService(CartRepository cartRepository, ItemRepository itemRepository) {
        this.cartRepository = cartRepository;
        this.itemRepository = itemRepository;
    }

    public Cart createCart() {
        return cartRepository.save(new Cart());
    }

    public Cart getCart(Long id) {
        return cartRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cart not found"));
    }

    public Item addItemToCart(Long cartId, Long productId, String name, Double price, Integer quantity) {
        Cart cart = getCart(cartId);

        Optional<Item> existing = cart.getItems().stream()
            .filter(i -> i.getProductId() != null && i.getProductId().equals(productId))
            .findFirst();

        if (existing.isPresent()) {
            Item item = existing.get();
            item.setQuantity(item.getQuantity() + (quantity == null ? 1 : quantity));
            return itemRepository.save(item);
        }
        else {
            Item item = new Item();
            item.setProductId(productId);
            item.setName(name);
            item.setPrice(price == null ? 0.0 : price);
            item.setQuantity(quantity == null ? 1 : quantity);
            item.setCart(cart);
            cart.getItems().add(item);
            return itemRepository.save(item);
        }
    }

    public Item updateItem(Long cartId, Long itemId, Integer quantity) {
        getCart(cartId);
        Item item = itemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setQuantity(quantity);
        return itemRepository.save(item);
    }

    public void removeItem(Long cartId, Long itemId) {
        getCart(cartId);
        Item item = itemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found"));
        itemRepository.delete(item);
        return;
    }
}
