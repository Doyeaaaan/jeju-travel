package jeju.bear.auth.oauth;

public interface JwtIssuer {
    String issueFor(String subjectEmail);
}
