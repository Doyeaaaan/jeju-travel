package jeju.bear.auth.oauth.provider;

public interface OAuth2UserInfo {

    String getProviderId();

    OAuth2Provider getProvider();

    String getEmail();

    String getName();

}
