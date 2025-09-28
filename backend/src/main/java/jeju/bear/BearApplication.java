package jeju.bear;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class BearApplication {

	public static void main(String[] args) {
		SpringApplication.run(BearApplication.class, args);
	}

}
