package jeju.bear.place.dto;

import lombok.Data;

import java.util.List;

@Data
public class VisitJejuResponse {
    private List<Item> items;

    @Data
    public static class Item {
        private String contentsid;
        private String title;
        private String addr1;
        private String address;
        private String latitude;
        private String longitude;
        private String alltag;
        private String introduction;
        private RepPhoto repPhoto;
    }

    @Data
    public static class RepPhoto {
        private Photoid photoid;
    }

    @Data
    public static class Photoid {
        private String imgpath;
    }
}
