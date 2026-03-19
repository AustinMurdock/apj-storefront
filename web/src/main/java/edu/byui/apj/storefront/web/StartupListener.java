package edu.byui.apj.storefront.web;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class StartupListener {
    private final StoreInfo storeInfo;

    public StartupListener(StoreInfo storeInfo) {
        this.storeInfo = storeInfo;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        System.out.println("Application ready. Store name: " + storeInfo.getName());
    }
}
